import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/bookinginvoices';

class BookingInvoiceService extends AgentService {
  static async createBookingInvoices(bookingInvoices) {
    const response = await super.post(`${PATH}/list`, bookingInvoices);
    return (response);
  }

  static async getBookingInvoicesByBookingId(bookingId) {
    const response = await this.get(`/bookings/${bookingId}${PATH}`);
    return response;
  }
}

export default BookingInvoiceService;
