import { CancelOutlined, DeleteOutline } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { FocusEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FORM_TYPES } from 'src/constants';
import type { JobForm } from 'src/types/jobPost';
import { array } from 'src/utils';

function ActionableQuestionFormItem({
  type,
  title,
  description,
  options,
  onChange,
  onRemove,
  onBlur,
  errors,
  touched,
}: {
  index: number;
  type: string;
  title: string;
  description: string;
  options?: { isRequired?: boolean; items?: string[]; expectedAnswer?: any };
  onChange: (key: string, value: any) => void;
  onRemove: () => void;
  onBlur: (key: string) => void;
  errors: any;
  touched: any;
}) {
  const [isVisibleDescription, setVisibleDescription] = useState(!!description);
  const AnswerComponent = FORM_TYPES[type as keyof typeof FORM_TYPES].answerComponent;
  const ExtraOptions = FORM_TYPES[type as keyof typeof FORM_TYPES].extraOptions;
  const ExpectedAnswers = FORM_TYPES[type as keyof typeof FORM_TYPES].expectedAnswers;
  const { t } = useTranslation();

  const optionItems = array<string>(options?.items);

  const handleAddItem = () => {
    const copyOptionItems = JSON.parse(JSON.stringify(optionItems));
    copyOptionItems.push(`Option ${optionItems.length + 1}`);

    onChange('options.items', copyOptionItems);
  };

  const handleRemoveItem = (index: number) => {
    const copyOptionItems = JSON.parse(JSON.stringify(optionItems));

    copyOptionItems.splice(index, 1);
    onChange('options.items', copyOptionItems);
  };

  const handleChangeItem = (value: string, itemIndex: number) => {
    onChange(`options.items[${itemIndex}]`, value);
  };

  const handleChangeExtraOptions = (key: string, value: any) => {
    onChange(`options.${key}`, value);
  };

  return (
    <div className="border rounded-md">
      <div className="flex items-start gap-x-4 px-2 py-4">
        <Select
          value={type}
          onChange={(e) => {
            onChange('type', e.target.value);
          }}
          sx={{ width: '160px' }}
          size={'small'}
        >
          {Object.values(FORM_TYPES).map((formType) => (
            <MenuItem
              value={formType.id}
              key={formType.id}
            >
              {t(formType.label)}
            </MenuItem>
          ))}
        </Select>
        <div className="space-y-2 flex-1">
          <div>
            <TextField
              size={'medium'}
              fullWidth
              value={title ?? ''}
              onChange={(e) => {
                onChange('title', e.target.value);
              }}
              error={!!touched?.title && !!errors?.title}
              helperText={!!touched?.title && errors?.title}
              onBlur={() => onBlur('title')}
              label={t("Title")}
              sx={{ borderBottom: 0, fontSize: '24px', fontWeight: 500 }}
            />
          </div>
          {!isVisibleDescription ? (
            <Button
              size={'small'}
              color="inherit"
              sx={{ color: 'text.secondary', mx: -1 }}
              onClick={() => setVisibleDescription(true)}
            >
              {t("Add description")}
            </Button>
          ) : (
            <TextField
              fullWidth
              label={t("Description")}
              multiline
              rows={2}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setVisibleDescription(false);
                        onChange('description', '');
                      }}
                    >
                      <CancelOutlined fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={description ?? ''}
              onChange={(e) => onChange('description', e.target.value)}
            />
          )}
        </div>
      </div>
      {AnswerComponent !== null ? (
        <>
          <Divider />
          <div className="px-8 py-4">
            <AnswerComponent
              onAddItem={() => handleAddItem()}
              onRemoveItem={handleRemoveItem}
              onChangeItem={handleChangeItem}
              options={optionItems}
            />
          </div>
        </>
      ) : null}
      {ExpectedAnswers !== null ? (
        <>
          <Divider />
          <ExpectedAnswers
            expectedAnswer={options?.expectedAnswer}
            onChange={(val) => handleChangeExtraOptions('expectedAnswer', val)}
            options={optionItems}
          />
        </>
      ) : null}

      <Divider />
      <div className="px-2 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center text-sm">
            <Checkbox
              checked={!!options?.isRequired}
              onChange={(e) => onChange(`options.isRequired`, e.target.checked)}
            />
            <label className="text-sm">{t("Required")}</label>
          </div>
          {ExtraOptions !== null ? (
            <ExtraOptions
              onChange={handleChangeExtraOptions}
              options={options}
            />
          ) : null}
        </div>
        <div>
          <IconButton
            size="small"
            onClick={() => onRemove()}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default function QuestionForm() {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext<JobForm>();

  const applicantForm = array(values.applicantForm);

  const handleAddNewItem = () => {
    const _applicantForm = JSON.parse(JSON.stringify(applicantForm));
    _applicantForm.push({
      type: 'text',
      title: '',
      options: { isRequired: false },
      id: new Date().getTime().toString(),
    });

    setFieldValue('applicantForm', _applicantForm);
  };

  const handleRemoveItem = (index: number) => {
    const _applicantForm = JSON.parse(JSON.stringify(applicantForm));

    _applicantForm.splice(index, 1);

    setFieldValue('applicantForm', _applicantForm);
  };

  const handleChangeItem = (key: string, value: any, index: number) => {
    setFieldValue(`applicantForm[${index}].${key}`, value);
  };

  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography variant="h6">{t('applicantQuestions')}</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              {t('defineQuestions')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <Stack>
              <div className="space-y-4">
                {applicantForm.length > 0 ? (
                  <div className="space-y-4">
                    {applicantForm.map((form: any, ind) => (
                      <ActionableQuestionFormItem
                        index={ind}
                        key={form.id ?? form._id}
                        type={form.type}
                        title={form.title}
                        description={form.description}
                        options={form.options}
                        onChange={(key, value) => handleChangeItem(key, value, ind)}
                        onRemove={() => handleRemoveItem(ind)}
                        onBlur={(key: string) => setFieldTouched(`applicantForm[${ind}].${key}`)}
                        errors={errors?.applicantForm?.[ind]}
                        touched={(touched?.applicantForm as unknown as Array<any>)?.[ind]}
                      />
                    ))}
                  </div>
                ) : (
                  <div>{t('notAddedAnyQuestion')}</div>
                )}
                <Button
                  variant="outlined"
                  onClick={handleAddNewItem}
                >
                  {t('addNewQuestion')}
                </Button>
              </div>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
