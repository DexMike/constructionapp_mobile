class NumberFormatting {
  static asMoney(
    amount = 0,
    decimal = '.',
    decimalCount = 2,
    thousands = ',',
    prefix = '$ ',
    sufix = ''
  ) {
    let returnVal = '';
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
      const negativeSign = amount < 0 ? '-' : '';
      const amounDec = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount), 0);
      const i = amounDec.toString();
      const j = (i.length > 3) ? i.length % 3 : 0;
      returnVal = prefix + negativeSign
        + (j ? i.substr(0, j) + thousands : '')
        + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`)
        + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '')
        + sufix;
    } catch (e) {
      // console.log(e);
      return '0';
    }
    return returnVal;
  }
}


export default NumberFormatting;
