import Joi from 'joi';

type ValidationRule = {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'regex';
    required?: boolean;
    min?: number;
    max?: number;
    email?: boolean;
    items?: ValidationRule; // For array type
    properties?: JsonSchema; // For object type
    options?: {
        pattern?: string; // for regex patterns
        flags?: string; // for regex patterns
    }
};

type JsonSchema = Record<string, ValidationRule>;

function convertRuleToJoiSchema(rule: ValidationRule): Joi.Schema {
    let joiRule: Joi.Schema = Joi.any();

    switch (rule.type) {
        case 'string':
            joiRule = Joi.string();
            if (rule.min) {
                joiRule = (joiRule as Joi.StringSchema).min(rule.min);
            }
            if (rule.max) {
                joiRule = (joiRule as Joi.StringSchema).max(rule.max);
            }
            // Apply string-specific rules
            break;
        case 'number':
            joiRule = Joi.number();
            if (rule.min) {
                joiRule = (joiRule as Joi.NumberSchema).min(rule.min);
            }
            if (rule.max) {
                joiRule = (joiRule as Joi.NumberSchema).max(rule.max);
            }
            // Apply number-specific rules
            break;
        case 'boolean':
            joiRule = Joi.boolean();
            break;
        case 'regex':
            joiRule = Joi.string().regex(new RegExp(rule.options?.pattern, rule.options?.flags));
            break;
        case 'array':
            if (rule.items) {
                joiRule = Joi.array().items(convertRuleToJoiSchema(rule.items));
            } else {
                joiRule = Joi.array();
            }
            break;
        case 'object':
            if (rule.properties) {
                const objectSchema: Record<string, Joi.Schema> = {};
                for (const key in rule.properties) {
                    objectSchema[key] = convertRuleToJoiSchema(rule.properties[key]);
                }
                joiRule = Joi.object(objectSchema);
            } else {
                joiRule = Joi.object();
            }
            break;
        // Handle custom validations and other cases...
    }

    // Apply common rules like 'required'
    if (rule.required) {
        joiRule = joiRule.required();
    }

    return joiRule;
}

function convertJsonToJoiSchema(jsonSchema: JsonSchema): Joi.ObjectSchema {
    const schema: Record<string, Joi.Schema> = {};
    for (const key in jsonSchema) {
        schema[key] = convertRuleToJoiSchema(jsonSchema[key]);
    }
    return Joi.object(schema);
}

export default async function validateData(data: any, jsonSchema: JsonSchema): Promise<{ error?: Joi.ValidationError; value?: any }> {
    const schema = convertJsonToJoiSchema(jsonSchema);
    try {
        const value = await schema.validateAsync(data, { abortEarly: false });
        return { value };
    } catch (error) {
        return { error: error as Joi.ValidationError };
    }
}