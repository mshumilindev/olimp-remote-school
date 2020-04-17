import React, { useContext, useState } from 'react';
import Form from "../Form/Form";
import siteSettingsContext from "../../context/siteSettingsContext";

function ArticleAnswer({block, setAnswer, answers}) {
    const { translate, lang } = useContext(siteSettingsContext);
    const correctAnswers = block.value.correctAnswers.split(', ');
    const newFields = [{
        id: block.id,
        options: [],
        variant: 'alt',
        name: translate('answers')
    }];
    const [ formFields, setFormFields ] = useState(null);

    if ( block.value.type === 'text' ) {
        newFields[0].type = 'editor';
        newFields[0].value = '';
        newFields[0].name = translate('answer');
        delete newFields[0].options;
        delete newFields[0].variant;
    }
    else if ( block.value.type === 'formula' ) {
        newFields[0].type = 'formula';
        newFields[0].value = '';
        newFields[0].name = translate('answer');
        delete newFields[0].options;
        delete newFields[0].variant;
    }
    else {
        if ( correctAnswers.length === 1 ) {
            block.value.answers.forEach((answer, index) => {
                newFields[0].type = 'radio';
                newFields[0].value = '';
                newFields[0].options.push({
                    id: index,
                    name: answer[lang] ? answer[lang] : answer['ua']
                });
            });
        }
        else {
            block.value.answers.forEach((answer, index) => {
                newFields[0].type = 'checkboxes';
                newFields[0].value = [];
                newFields[0].options.push({
                    id: index,
                    name: answer[lang] ? answer[lang] : answer['ua']
                });
            });
        }
    }

    if ( !formFields ) {
        setFormFields(Object.assign([], newFields));
    }

    return (
        <div className="article__answers">
            {
                formFields ?
                    <Form fields={formFields} setFieldValue={setFieldValue}/>
                    :
                    null
            }
        </div>
    );

    function setFieldValue(fieldID, value) {
        const currentFields = formFields;
        const newAnswer = answers.blocks.find(item => item.id === block.id);

        if ( newAnswer ) {
            if ( correctAnswers.length === 1 ) {
                setAnswer(fieldID, [value]);
            }
            else {
                if ( newAnswer.value.indexOf(value) !== -1 ) {
                    setAnswer(fieldID, newAnswer.value.filter(item => item !== value));
                }
                else {
                    setAnswer(fieldID, [...newAnswer.value, value]);
                }
            }
        }
        else {
            setAnswer(fieldID, [value]);
        }

        console.log(formFields);

        if ( correctAnswers.length === 1 ) {
            currentFields[0].value = value;
        }
        else {
            if ( currentFields[0].value.indexOf(value) !== -1 ) {
                currentFields[0].value.splice(currentFields[0].value.indexOf(value), 1);
            }
            else {
                currentFields[0].value.push(value);
            }
        }

        setFormFields(Object.assign([], currentFields));
    }
}

export default ArticleAnswer;