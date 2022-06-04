/**
 * @file
 * Actions related to sharing and sharing/export state
 */

import { SHARE_TYPES } from '@flightsheet/constants';
import { ExpensesTable, FlightsheetPdf } from '@flightsheet/file-export';
import { formatDate } from '@flightsheet/utils';
import remoteConfig from '@react-native-firebase/remote-config';
import { action, flow, observable } from 'mobx';
import { Alert, Share } from 'react-native';

import crashlytics from '../utils/crashlyticsDecorator';
import { exportPdfFile, exportXlsFile } from '../utils/file-export';

export default class ShareStore {

  constructor(root) {
    this.Trips = root.trips;
    this.Settings = root.settings;
    this.FileStore = root.file;
    this.ConfigStore = root.config;
  }

  @observable exportData = null;

  @action
  @crashlytics('type', 'payload')
  export(type, payload) {
    switch (type) {
      case SHARE_TYPES.PDF: return this.exportTripToPdf(payload);
      case SHARE_TYPES.EXCEL: return this.exportTripsToExcel(payload);
      default: throw new Error('Unsupported type');
    }
  }

  @action
  async exportTripToPdf([ id ]) {
    console.info('export pdf for id: ', id);
    this.exportData = null;
    try {
      const trip = this.Trips._list.find(t => t.id === id);
      if (!trip) throw new Error('Failed to match the trip to export');

      if (trip.postFlightList.length === 0) trip.data.postFlight = this.Settings.postFlightChecklist;
      await addImageRemoteUrls(trip.expenses, this.FileStore.storage);
      await addImageRemoteUrls(trip.squawkBox, this.FileStore.storage);

      // format custom title
      const formattedTitle = trip.title.replace(/\/|\s+/g, '-').toUpperCase();

      this.exportData = await exportPdfFile({
        template: FlightsheetPdf,
        data: trip,
        filename: formattedTitle,
        remoteConfig,
      });
      if (!this.exportData) throw new Error('Export Failed');
      if (this.exportData.pageCount === 0) {
        Alert.alert('Insufficient data to generate a report, please enter some trip data before exporting.');
        return;
      }

      return this.exportData;

    } catch (error) {
      onExportError(error);
    }

  }

  @action
  @crashlytics()
  async shareExportedPdf() {
    const { filePath } = this.exportData;

    const result = await Share.share({ url: filePath })
      .catch(onShareError);

     console.info('Share PDF completed: ', result);
  }

  @action
  exportTripsToExcel = flow(
    /**
     * @yields
     * @this ShareStore
     * @param {Array} ids
     * @returns {Generator<Promise>}
     */
    function *(ids = []) {
    console.info('export xls for ids: ', ids);

    try {
      if (!ids || !ids.length) throw new Error('No ids provided');
      this.exportData = null;

      const trips = this.Trips._list.filter(t => ids.includes(t.id));
      if (trips.length !== ids.length) {
        console.warn('Failed to match some trips by id');
      }

      const tableData = trips.flatMap(trip => trip.expenses.map(expense => ({
          flightsheet: trip.title,
          date: expense.date.toDate(),
          paymentMethod: expense.paymentMethod,
          location: expense.location,
          type: expense.type,
          cost: expense.cost,
          description: expense.description,
          fuelAmount: expense.fuelAmount || 'n/a',
          isHighlighted: expense.isHighlighted,
        })));

      const title = createExpenseTableTitle();
      const filename = createExpenseReportFilename(tableData);

      this.exportData = yield exportXlsFile({ template: ExpensesTable, filename, data: { title, tableData } });

      return this.exportData;
    }
    catch (error) {
      onExportError(error);
    }
  });

  @action
  @crashlytics()
  async shareExportedXls() {
    const { filePath } = this.exportData;

    const result = await Share.share({ url: filePath })
      .catch(onShareError);

    console.info('Share XLSX completed: ', result);
  }
}

const createExpenseTableTitle = () => `Flightsheet Expense Roundup (Generated: ${formatDate(new Date())})`;

const createExpenseReportFilename = (tableData) => {
  const [first] = tableData;
  const last = tableData.slice().pop();

  const startDate = formatDate(first.date);
  const endDate = formatDate(last.date);

  let fileName = `Flightsheet Expenses ${startDate}`;
  if (startDate !== endDate) fileName  += ` - ${endDate}`;

  return fileName;
};

const onExportError = (error) => {
  console.info(error);
  crashlytics.logError(error);
  Alert.alert('Something went wrong with the export. Please try again later');
};

const onShareError = (error) => {
  // Operation cancelled
  if (error.code === 'ENSCOCOAERRORDOMAIN3072') return 'cancelled';

  crashlytics.logError(error);
  Alert.alert('Something went wrong trying to share the file. Please try again later');

  return error;
};

// Temp fix for PDF images
const addImageRemoteUrls = async (itemWithPhotos, storage) => {
  const tasks = itemWithPhotos.map(({ photos = [] }) => Promise.all(
    photos.map(async (photo) => {
      if (photo.remoteUri) return;

      photo.remoteUri = await storage
        .ref(photo.relativePath)
        .getDownloadURL();
    }),
  ));

  return Promise.all(tasks);
};
