import {
  ChoiseAnswer,
  MultiSelectExpectedAnswer,
  MultipleChoiseAnswer,
  NumberExpectedAnswer,
  PriceExpectedAnswer,
  PriceExtraOptions,
  SelectExpectedAnswer,
  //VideoAnswer,
  YesNoExpectedAnswer,
} from 'src/components';

export const APP_NAME = "T3 Bursiyer Platformu"

export const FORM_TYPES = {
  text: {
    id: 'text',
    label: 'Text',
    answerComponent: null,
    extraOptions: null,
    expectedAnswers: null,
  },
  multiline: {
    id: 'multiline',
    label: 'Multiline',
    answerComponent: null,
    extraOptions: null,
    expectedAnswers: null,
  },
  number: {
    id: 'number',
    label: 'Number',
    answerComponent: null,
    extraOptions: null,
    expectedAnswers: NumberExpectedAnswer,
  },
  price: {
    id: 'price',
    label: 'Price',
    answerComponent: null, //TODO: create answer component,
    extraOptions: PriceExtraOptions,
    expectedAnswers: PriceExpectedAnswer,
  },
  //TODO: implement next version
  // 'video-answer': {
  //   id: 'video-answer',
  //   label: 'Video Answer',
  //   answerComponent: VideoAnswer,
  //   extraOptions: null,
  //   expectedAnswers: null,
  // },
  trueFalse: {
    id: 'trueFalse',
    label: 'Yes / No',
    answerComponent: null,
    extraOptions: null,
    expectedAnswers: YesNoExpectedAnswer,
  },
  choice: {
    id: 'choice',
    label: 'Choice',
    answerComponent: ChoiseAnswer,
    extraOptions: null,
    expectedAnswers: SelectExpectedAnswer,
  },
  'multiple-choices': {
    id: 'multiple-choices',
    label: 'Multiple Choices',
    answerComponent: MultipleChoiseAnswer,
    extraOptions: null,
    expectedAnswers: MultiSelectExpectedAnswer,
  },
};

export const locationTypes = [
  {
    label: 'On-site',
    value: 'onsite',
  },
  {
    label: 'Hybrid',
    value: 'hybrid',
  },
  {
    label: 'Remote',
    value: 'remote',
  },
];

export const CHECKLIST_ITEM_FORM = {
  text: {
    id: 'text',
    label: 'Text',
  },
  file: {
    id: 'file',
    label: 'File',
  },
};