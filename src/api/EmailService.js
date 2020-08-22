import AgentService from './AgentService';

/* const date = new Date();
const email = {
  toEmail: 'mike@trelar.net',
  toName: 'Test Subject #326',
  subject: `Test | ${date.getHours()}:${date.getMinutes()}`,
  isHTML: true,
  body: '<strong>BOLD TEXT!</strong><br><br>Testing...',
  recipients: [
    {name: 'Trelar Customer #1', email: 'mike@trelar.net'},
    {name: 'Trelar Customer #2', email: 'mike@trelar.net'}
  ],
  attachments: [
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'https://d2x9cff48m5sea.cloudfront.net/public/2019/04/9nYLsF.jpg'
  ]
};
await EmailService.sendEmail(email); */

const PATH = '/email';

class EmailService extends AgentService {
  static async sendEmail(email) {
    const response = await super.post(PATH, email);
    return (response);
  }

  static async sendEmailToNonUsers(email) {
    const response = await super.post(`/notifications${PATH}`, email);
    return response;
  }

  static async sendEmailToNonUsersOnBoarding(email, accessToken, idToken) {
    const response = await super.post(`/notifications${PATH}`, email, accessToken, idToken);
    return response;
  }
}

export default EmailService;
