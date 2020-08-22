import React from 'react';
// import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import TCardsContainer from './TCardsContainer';
import {Text} from 'react-native-elements';

describe('<TCardsContainer />', () => {
  it('should render', () => {
    const data = [
      {id: 1}
    ];
    const renderCard = () => { return <Text>Test</Text> };
    renderer.create(<TCardsContainer data={data} renderCard={renderCard} />);
    // const wrapper = mount(<TCardsContainer data={data} renderCard={renderCard} />);
    // https://github.com/airbnb/enzyme/issues/1436 need a react native adapter
  });
});
