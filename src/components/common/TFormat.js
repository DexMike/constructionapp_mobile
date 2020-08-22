import React, { /* Component */} from 'react';
import moment from 'moment-timezone';
import NumberFormat from 'react-number-format';
import {Alert, Linking, Text} from 'react-native';

const toMil = 0.62137119;
const toKm = 1.609344;

class TFormat {

  static asLink(link, title) {
    return (
      <Text style={{color: 'rgb(0, 111, 83)', textDecorationLine: 'underline'}}
            onPress={() => Linking.openURL(link)}>
        {`${title}`}
      </Text>
    );
  }

  static mobileAmericanNumber(phoneNumberString) {
    let input = phoneNumberString.replace(/\D/g,'');

    input = input.substring(0,10);

    const size = input.length;
    if(size == 0) {
      input = input;
    } else if (size < 4) {
      input = '('+input;
    } else if (size < 7) {
      input = '('+input.substring(0,3)+') '+input.substring(3,6);
    } else {
      input = '('+input.substring(0,3)+') '+input.substring(3,6)+' - '+input.substring(6,10);
    }
    return input;
  }

  static asMoney(inputValue, style) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix=""
        renderText={value => <Text style={style}>{value}</Text>}
      />
    );
  }

  static asMoneyNoDecimals(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix=""
        isNumericString
        renderText={value => value}
      />
    );
  }

  static asHoursAndMinutes(time) {
    const minutes = time - Math.floor(time);
    const hours = Math.trunc(time);
    const returnTime = hours + "h " + Math.ceil(minutes*60) + "m";  // Answer
    return (
      <Text>{returnTime}</Text>
    );
  }

  static timeDifferenceAsHoursAndMinutes(endTime, startTime) {
    let timeDiff = endTime - startTime;    // difference in ms
    let duration = moment.duration(timeDiff);
    let hours = duration.days() * 24 + duration.hours();
    let min = duration.minutes();
    const timeDifference = hours + "h " + min + "m";  // Answer
    return (
      <Text>{timeDifference}</Text>
    );
  }

  static asMoneyByHour(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix="&nbsp;/&nbsp;Hour"
      />
    );
  }

  static asMoneyByTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix="&nbsp;/&nbsp;Ton"
      />
    );
  }

  // inputRateType
  // inputRate
  // inputeRateEstimate
  static asMoneyByRate(inputRateType, inputRate, inputRateEstimate) {
    if (inputRateType === 'Hour') {
      return TFormat.asMoney(inputRate * inputRateEstimate);
    }
    if (inputRateType === 'Ton') {
      return TFormat.asMoney(inputRate * inputRateEstimate);
    }
    return '$ 0.00';
  }

  static asHours(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        // decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;Hours"
      />
    );
  }


  static asTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        // decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;Tons"
      />
    );
  }

  static asTonsByTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;/&nbsp;Tons"
      />
    );
  }

  static asTonsByHours(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;/&nbsp;Hour"
      />
    );
  }

  static mobilePhone(inputValue) {
    // <NumberFormat format="+1 (###) ###-####" mask="_" />
    return (
      <Text style={{color: '#006F53'}}
        onPress={() => Linking.openURL(`tel:${inputValue}`)}
      >
        <NumberFormat
          value={inputValue}
          displayType="text"
          format="(###) ###-####"
          mask=""
          renderText={
            value => <Text>{value}</Text>
          }
        />
      </Text>
    );
  }

  static mobileEmail(inputValue) {
    return (
      <Text style={{color: '#006F53'}}
        onPress={() => {
          Alert.alert(
            '',
            'Would you like to send an email?',
            [
              {text: 'Cancel'},
              {text: 'Compose Email', onPress: () => Linking.openURL(`mailto:${inputValue}`)}
            ]
          );
        }}
      >
        {inputValue}
      </Text>
    );
  }

  // Some refs regarding Intl object, which returns the locale from
  // the browser if the user doesn't have a timeZone setting
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/resolvedOptions
  // https://stackoverflow.com/questions/37798404/getting-timezone-using-intl-api-doesnt-work-in-firefox
  // http://kangax.github.io/compat-table/esintl/#test-DateTimeFormat_resolvedOptions().timeZone_defaults_to_the_host_environment

  static asDate(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('MM/DD/YYYY');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY');
  }
  
  // i.e. Wednesday, July 31st
  static asDateOrdinal(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('dddd, MMMM Do');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('dddd, MMMM Do');
  }
  
  // i.e. Wed, Jul 31st
  static asDateOrdinalAbbreviated(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('ddd, MMM Do');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('ddd, MMM Do');
  }

  static asTime(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('hh:mm a');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('hh:mm a');
  }

  static asDateTime(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('MM/DD/YYYY hh:mm a');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY hh:mm a');
  }

  // i.e. Wednesday, July 31st, 2019 3:00 PM
  static asDayWeek(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('LLLL');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('LLLL');
  }

  static asDateListItem(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('MM/DD @ hh:mm a');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD @ hh:mm a');
  }

  static asZip5(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        type="text"
        format="#####"
        mask="_"
      />
    );
  }

  static asPercent(inputValue, decimal = 0) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={decimal}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="%"
      />
    );
  }

  static asWholeNumber(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={0}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=""
      />
    );
  }


  static asNumber(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=""
      />
    );
  }

  materialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }

  static asMetersToMiles(inputValue) {
    // Added this one since mapbox response returns the value in
    // meters when getting the distance between locations
    const miles = inputValue * toMil / 1000;
    return `${miles.toFixed(2)} miles`;
  }

  static asKilometersToMiles(inputValue) {
    const miles = inputValue * toMil;
    return (
      <NumberFormat
        value={miles}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" miles"
      />
    );
  }

  static asMilesToKilometers(inputValue) {
    const km = inputValue * toKm;
    return (
      <NumberFormat
        value={km}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" km"
      />
    );
  }

  static asSecondsToHms(inputValue) {
    const h = Math.floor(inputValue / 3600);
    const m = Math.floor((inputValue % 3600) / 60);
    const s = Math.floor(inputValue % 3600 % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
    // const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
    return hDisplay + mDisplay;
  }

  static asDistance(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" mi"
        renderText={value => <Text>{value}</Text>}
      />
    );
  }
}

export default TFormat;
