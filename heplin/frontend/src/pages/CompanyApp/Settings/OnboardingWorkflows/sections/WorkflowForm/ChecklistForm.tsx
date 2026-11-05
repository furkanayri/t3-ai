import {
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { CancelCircleIcon, Delete01Icon } from 'hugeicons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomButton } from 'src/components/shared';
import { CHECKLIST_ITEM_FORM } from 'src/constants';
import { OnboardingWorkflowPayload } from 'src/types';
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
  const { t } = useTranslation();

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
          {Object.values(CHECKLIST_ITEM_FORM).map((formType) => (
            <MenuItem
              value={formType.id}
              key={formType.id}
            >
              {t(formType.label.toLowerCase())}
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
              label={t("title")}
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
              {t('Add description')}
            </Button>
          ) : (
            <TextField
              fullWidth
              label={t("Description")}
              multiline
              minRows={2}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('clear')}>
                      <IconButton
                        onClick={() => {
                          setVisibleDescription(false);
                          onChange('description', '');
                        }}
                      >
                        <CancelCircleIcon size={18} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={description ?? ''}
              onChange={(e) => onChange('description', e.target.value)}
              sx={{ marginTop: '12px !important' }}
            />
          )}
          <div className='flex items-center justify-end'>
            <Tooltip title={t('delete')}>
              <IconButton
                size="small"
                onClick={() => onRemove()}
              >
                <Delete01Icon size={18} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionForm() {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext<OnboardingWorkflowPayload>();

  const items = array(values.items);

  const handleAddNewItem = () => {
    const _items = JSON.parse(JSON.stringify(items));
    _items.push({
      type: 'text',
      title: '',
      id: new Date().getTime().toString(),
    });

    setFieldValue('items', _items);
  };

  const handleRemoveItem = (index: number) => {
    const _items = JSON.parse(JSON.stringify(items));

    _items.splice(index, 1);

    setFieldValue('items', _items);
  };

  const handleChangeItem = (key: string, value: any, index: number) => {
    setFieldValue(`items[${index}].${key}`, value);
  };

  return (

    <Stack>
      <div className="space-y-4">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((form: any, ind) => (
              <ActionableQuestionFormItem
                index={ind}
                key={form.id ?? form._id}
                type={form.type}
                title={form.title}
                description={form.description}
                options={form.options}
                onChange={(key, value) => handleChangeItem(key, value, ind)}
                onRemove={() => handleRemoveItem(ind)}
                onBlur={(key: string) => setFieldTouched(`items[${ind}].${key}`)}
                errors={errors?.items?.[ind]}
                touched={(touched?.items as unknown as Array<any>)?.[ind]}
              />
            ))}
          </div>
        ) : (
          <div>
            <p className='text-[14px]'>{t('Not added any item')}</p>
          </div>
        )}
        <CustomButton
          onClick={handleAddNewItem}
          sx={{
            backgroundColor: "#fff",
            color: "#E31E24",
            border: "1px solid #E31E24",
            boxShadow: "none",
            px: "22px",
            fontSize: "14px",
            fontWeight: 400,
            height: "30px",
            '&:hover': {
              backgroundColor: "#fff",
              boxShadow: "none"
            }
          }}
        >
          {t('Add New Item')}
        </CustomButton>
      </div>
    </Stack>
  );
}
