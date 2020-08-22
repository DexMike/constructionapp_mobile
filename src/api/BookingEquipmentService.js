import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/bookingequipments';

class BookingEquipmentService extends AgentService {
  static async getBookingEquipments() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createBookingEquipments(bookingEquipment) {
    const response = await super.post(PATH, bookingEquipment);
    return (response);
  }

  static async allocateDrivers(bookingEquipments, bookingId) {
    const response = await super.post(`/bookings/${bookingId}${PATH}/allocate`, bookingEquipments);
    return response;
  }

  static async updateBookingEquipment(bookingEquipment) {
    const response = await this.put(PATH, bookingEquipment);
    return (response);
  }

  static async deleteBookingEquipmentById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getBookingEquipmentById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getBookingEquipmentsByBookingId(bookingId) {
    const response = await this.get(`/bookings/${bookingId}${PATH}`);
    return (response);
  }

  static getDefaultBookingEquipment() {
    return {
      bookingId: 0,
      schedulerId: 0,
      driverId: 0,
      equipmentId: 0,
      rateType: 'Hour',
      rateActual: '0',
      startTime: '',
      endTime: '',
      startAddressId: 0,
      endAddressId: 0,
      notes: '',
      createdBy: [],
      createdOn: moment.utc().format(),
      modifiedBy: [],
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };
  }
}

export default BookingEquipmentService;
