import React from 'react';
import SiteSettingsContext from '../context/siteSettingsContext';
import firebase from "../db/firestore";

const db = firebase.firestore();

// === Methods must be moved to redux, properties must be moved to context to make stateless components

export default class SiteSettingsProvider extends React.Component {
    constructor() {
        super();
        this.state = {
            siteName: localStorage.getItem('siteSettings') ? JSON.parse(localStorage.getItem('siteSettings')).data.data.siteName[localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ua'] : 'Колегіум "Олімп"',
            translations: [],
            lang: localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ua',
            level: '1a',
            changeLang: (lang) => {
                this.setLang(lang);
            },
            translate: (term) => {
                return !this.state.translations[this.state.lang] || !this.state.translations[this.state.lang][term] ? term :this.state.translations[this.state.lang][term];
            },
            identify: (value) => {
                return this.identify(value);
            },
            transliterize: (value) => {
                return this.transliterize(value);
            },
            // === Need to optimize model and formfields functions, replace it with a single function
            getUserFormFields: (currentUser, user, passwordAction, isStudent) => {
                return this.getUserFormFields(currentUser, user, passwordAction, isStudent);
            },
            getUserModel: (role, id) => {
                return this.getUserModel(role, id);
            },
            getDocFormFields: (name, tags, teacher, action) => {
                return this.getDocFormFields(name, tags, teacher, action);
            },
            getSubjectModel: () => {
                return this.getSubjectModel();
            },
            getSubjectFields: (subject) => {
                return this.getSubjectFields(subject);
            },
            getCourseModel: () => {
                return this.getCourseModel();
            },
            getCourseFields: (currentUser, course) => {
                return this.getCourseFields(currentUser, course);
            },
            getModuleModel: () => {
                return this.getModuleModel();
            },
            getModuleFields: (module) => {
                return this.getModuleFields(module);
            },
            getLessonModel: () => {
                return this.getLessonModel();
            },
            getLessonFields: (lesson, hasBtn) => {
                return this.getLessonFields(lesson, hasBtn);
            }
        };
    }

    componentDidMount() {
        if ( !localStorage.getItem('lang') ) {
            localStorage.setItem('lang', 'ua');
        }
        this.getUpdates();
        this.getTranslations();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ( prevState.lang !== this.state.lang && !this.state.translations[this.state.lang] ) {
            this.getTranslations();
        }
    }

    render() {
        return (
            <SiteSettingsContext.Provider value={this.state}>
                {
                    this.props.children
                }
            </SiteSettingsContext.Provider>
        )
    }

    getUpdates() {
        const updatesCollection = db.collection('updates');
        const savedUpdates = localStorage.getItem('updates') ? JSON.parse(localStorage.getItem('updates')) : null;

        updatesCollection.get().then(snapshot => {
            const translationsUpdates = snapshot.docs.find(doc => doc.id === 'translations');

            if ( savedUpdates ) {
                if ( translationsUpdates.exists && (!savedUpdates.translations || translationsUpdates.data().date > savedUpdates.translations) ) {
                    localStorage.removeItem('translationsua');
                    localStorage.removeItem('translationsru');
                    localStorage.removeItem('translationsen');
                    localStorage.removeItem('translationsList');
                    localStorage.setItem('updates', JSON.stringify({
                        ...savedUpdates,
                        translations: translationsUpdates.data().date
                    }));
                    this.getTranslations();
                }
            }
            else {
                if ( translationsUpdates.exists ) {
                    localStorage.setItem('updates', JSON.stringify({
                        translations: translationsUpdates.data().date
                    }));
                }
            }
        });
    }

    setLang(lang) {
        localStorage.setItem('lang', lang);
        this.setState(() => {
            return {
                lang: lang
            }
        });
    }

    getTranslations() {
        const newTranslations = this.state.translations;
        const { lang } = this.state;

        if ( !localStorage.getItem('translations' + lang) ) {
            const navCollection = db.collection('translations').doc(lang);

            navCollection.get().then((doc) => {
                newTranslations[lang] = doc.data();

                this.setState(() => {
                    return {
                        translations: newTranslations
                    }
                });
                localStorage.setItem('translations' + lang, JSON.stringify(newTranslations[lang]));
            });
        }
        else {
            newTranslations[lang] = JSON.parse(localStorage.getItem('translations' + lang));
            this.setState(() => {
                return {
                    translations: newTranslations
                }
            });
        }
    }

    identify(value) {
        return value.replace(/^a-z0-9]/gi,'').replace(/\?/g,'').split(' ').join('_').toLowerCase();
    }

    transliterize(value) {
        let newValue = value.split('');

        const dictionary = {
            'А': 'A',
            'а': 'a',
            'Б': 'B',
            'б': 'b',
            'В': 'V',
            'в': 'v',
            'Г': 'H',
            'г': 'h',
            'Д': 'D',
            'д': 'd',
            'Е': 'E',
            'е': 'e',
            'Є': 'Ie',
            'є': 'ie',
            'Ж': 'Zh',
            'ж': 'zh',
            'З': 'Z',
            'з': 'z',
            'И': 'Y',
            'и': 'y',
            'І': 'I',
            'і': 'i',
            'Ї': 'Ii',
            'ї': 'ii',
            'Й': 'Y',
            'й': 'y',
            'К': 'K',
            'к': 'k',
            'Л': 'L',
            'л': 'l',
            'М': 'M',
            'м': 'm',
            'Н': 'N',
            'н': 'n',
            'О': 'O',
            'о': 'o',
            'П': 'P',
            'п': 'p',
            'Р': 'R',
            'р': 'r',
            'С': 'S',
            'с': 's',
            'Т': 'T',
            'т': 't',
            'У': 'U',
            'у': 'u',
            'Ф': 'F',
            'ф': 'f',
            'Х': 'Kh',
            'х': 'kh',
            'Ц': 'Ts',
            'ц': 'ts',
            'Ч': 'Ch',
            'ч': 'ch',
            'Ш': 'Sh',
            'ш': 'sh',
            'Щ': 'Shch',
            'щ': 'shch',
            'Ь': '\'',
            'ь': '\'',
            'Ю': 'Iu',
            'ю': 'iu',
            'Я': 'Ia',
            'я': 'ia'
        };

        newValue.forEach((char, index) => {
            if ( dictionary[char] ) {
                newValue[index] = dictionary[char];
            }
        });

        return newValue.join('');
    }

    getSubjectModel() {
        return {
            name: {
                ua: '',
                ru: '',
                en: ''
            },
            id: ''
        }
    }

    getSubjectFields(subject) {
        const { translate } = this.state;

        return [
            {
                type: 'text',
                name: 'subjectName_ua',
                id: 'subjectName_ua',
                placeholder: translate('title') + ' ' + translate('in_ua'),
                value: subject.name.ua,
                required: true,
                updated: false
            },
            {
                type: 'text',
                name: 'subjectName_ru',
                id: 'subjectName_ru',
                placeholder: translate('title') + ' ' + translate('in_ru'),
                value: subject.name.ru,
                updated: false
            },
            {
                type: 'text',
                name: 'subjectName_en',
                id: 'subjectName_en',
                placeholder: translate('title') + ' ' + translate('in_en'),
                value: subject.name.en,
                updated: false
            },
            {
                type: 'submit',
                name: subject.id ? translate('update') : translate('create'),
                id: 'subjectSubmit',
            }
        ]
    }

    getCourseModel() {
        return {
            name: {
                ua: '',
                ru: '',
                en: ''
            },
            id: '',
            index: '',
            teacher: '',
            textbook: ''
        }
    }

    getCourseFields(currentUser, course) {
        const { translate } = this.state;

        return [
            {
                type: 'text',
                name: 'courseName_ua',
                id: 'courseName_ua',
                placeholder: translate('title') + ' ' + translate('in_ua'),
                value: course.name.ua,
                required: true,
                updated: false
            },
            {
                type: 'text',
                name: 'courseName_ru',
                id: 'courseName_ru',
                placeholder: translate('title') + ' ' + translate('in_ru'),
                value: course.name.ru,
                updated: false
            },
            {
                type: 'text',
                name: 'courseName_en',
                id: 'courseName_en',
                placeholder: translate('title') + ' ' + translate('in_en'),
                value: course.name.en,
                updated: false
            },
            {
                type: 'block',
                heading: translate('teacher'),
                id: 'teacher_block',
                children: [
                    {
                        type: 'userPicker',
                        name: 'userPicker',
                        placeholder: translate('select_teacher'),
                        id: 'teacher',
                        value: course.teacher ? course.teacher : currentUser.role === 'teacher' ? currentUser.id : '',
                        updated: false
                    }
                ]
            },
            {
                type: 'block',
                heading: translate('textbook'),
                id: 'textbook_block',
                children: [
                    {
                        type: 'libraryPicker',
                        name: 'libraryPicker',
                        placeholder: translate('select_textbook'),
                        id: 'textbook',
                        value: course.textbook,
                        updated: false,
                        multiple: true
                    }
                ]
            },
            {
                type: 'submit',
                name: course.id ? translate('update') : translate('create'),
                id: 'courseSubmit',
            }
        ]
    }

    getModuleModel() {
        return {
            name: {
                ua: '',
                ru: '',
                en: ''
            },
            id: ''
        }
    }

    getModuleFields(module) {
        const { translate } = this.state;

        return [
            {
                type: 'text',
                name: 'moduleName_ua',
                id: 'moduleName_ua',
                placeholder: translate('title') + ' ' + translate('in_ua'),
                value: module.name.ua,
                required: true,
                updated: false
            },
            {
                type: 'text',
                name: 'moduleName_ru',
                id: 'moduleName_ru',
                placeholder: translate('title') + ' ' + translate('in_ru'),
                value: module.name.ru,
                updated: false
            },
            {
                type: 'text',
                name: 'moduleName_en',
                id: 'moduleName_en',
                placeholder: translate('title') + ' ' + translate('in_en'),
                value: module.name.en,
                updated: false
            },
            {
                type: 'submit',
                name: module.id ? translate('update') : translate('create'),
                id: 'moduleSubmit',
            }
        ]
    }

    getLessonModel() {
        return {
            name: {
                ua: '',
                ru: '',
                en: ''
            },
            id: ''
        }
    }

    getLessonFields(lesson, hasBtn = true) {
        const { translate } = this.state;

        const lessonFields = [
            {
                type: 'text',
                name: 'lessonName_ua',
                id: 'lessonName_ua',
                placeholder: translate('title') + ' ' + translate('in_ua'),
                value: lesson ? lesson.name.ua : '',
                required: true,
                updated: false
            },
            {
                type: 'text',
                name: 'lessonName_ru',
                id: 'lessonName_ru',
                placeholder: translate('title') + ' ' + translate('in_ru'),
                value: lesson ? lesson.name.ru : '',
                updated: false
            },
            {
                type: 'text',
                name: 'lessonName_en',
                id: 'lessonName_en',
                placeholder: translate('title') + ' ' + translate('in_en'),
                value: lesson ? lesson.name.en : '',
                updated: false
            }
        ];
        if ( hasBtn ) {
            lessonFields.push({
                type: 'submit',
                name: lesson.id ? translate('update') : translate('create'),
                id: 'lessonSubmit',
            });
        }
        return lessonFields;
    }

    getUserModel(role) {
        const defaultModel = {
            name: '',
            login: '',
            password: '',
            role: role ? role : '',
            canSeeGuests: false,
            isManagement: false,
            status: 'suspended',
            isNew: true,
            email: '',
            tel: '',
            skype: ''
        };

        switch (role) {
            case 'admin':
                return {
                    ...defaultModel
                };

            default:
                return defaultModel;
        }
    }

    getUserFormFields(currentUser, user, passwordAction, isStudent) {
        const { translate } = this.state;

        // === Need to move this to json file
        const formFields = [
            {
                type: 'image',
                id: 'avatar',
                name: 'avatar',
                label: 'choose_avatar',
                value: user ? user.avatar : '',
                icon: 'fas fa-camera-retro',
                shape: 'round',
                size: 150,
                saveSize: 400,
                remove: true,
                rotation: true
            },
            {
                type: 'cols',
                id: 'infoCols',
                children: [
                    {
                        type: 'select',
                        id: 'role',
                        name: 'role',
                        placeholder: 'role',
                        hasErrors: false,
                        required: true,
                        value: user ? user.role : '',
                        storedValue: user ? user.role : '',
                        updated: false,
                        readonly: user ? !user.isNew && user.role !== 'guest' : false,
                        options: [
                            {
                                id: 'admin',
                                title: translate('admin')
                            },
                            {
                                id: 'teacher',
                                title: translate('teacher')
                            },
                            {
                                id: 'student',
                                title: translate('student')
                            },
                            {
                                id: 'guest',
                                title: translate('guest')
                            }
                        ]
                    },
                    {
                        type: 'checkbox',
                        id: 'status',
                        name: 'status',
                        label: 'status',
                        value: user ? user.status : '',
                        checked: 'active',
                        unchecked: 'suspended',
                        readonly: user.id === currentUser.id
                    },
                ]
            },
            {
                type: 'checkbox',
                id: 'canSeeGuests',
                name: 'canSeeGuests',
                label: 'can_see_guests',
                value: user ? user.canSeeGuests : '',
                checked: true,
                unchecked: false,
                hidden: currentUser.role !== 'admin'
            },
            {
                type: 'radio',
                id: 'isManagement',
                name: 'isManagement',
                placeholder: translate('is_management'),
                options: [{
                  name: 'teacher',
                  icon: 'fas fa-chess-knight',
                  id: 'teacher'
                },
                {
                  name: 'deputy',
                  icon: 'fas fa-chess-rook',
                  id: 'deputy'
                },
                {
                  name: 'headmaster',
                  icon: 'fas fa-chess-queen',
                  id: 'headmaster'
                }],
                value: user?.isManagement || 'teacher',
                hidden: currentUser.role !== 'admin' || user.role !== 'teacher'
            },
            {
                type: 'tabs',
                id: 'infoTabs',
                tabs: [
                    {
                        heading: 'info',
                        content: [
                            {
                                type: 'text',
                                id: 'name',
                                name: 'name',
                                placeholder: 'name',
                                hasErrors: false,
                                required: true,
                                value: user ? user.name : '',
                                updated: false
                            },
                            {
                                type: 'text',
                                id: 'login',
                                name: 'login',
                                placeholder: 'login',
                                hasErrors: false,
                                errorMessage: null,
                                required: true,
                                value: user ? user.login : '',
                                updated: false,
                                readonly: isStudent
                            },
                            {
                                type: 'text',
                                id: 'password',
                                name: 'password',
                                placeholder: 'password',
                                hasErrors: false,
                                required: true,
                                value: user ? user.password : '',
                                updated: false,
                                btn: {
                                    icon: 'fas fa-random',
                                    action: passwordAction ? passwordAction : null,
                                    title: translate('generate')
                                }
                            },
                            {
                                type: 'block',
                                id: 'contactsBlock',
                                heading: 'contacts',
                                children: [
                                    {
                                        type: 'email',
                                        id: 'email',
                                        name: 'email',
                                        placeholder: 'email',
                                        hasErrors: false,
                                        value: user ? user.email : '',
                                        updated: false,
                                        icon: 'far fa-envelope'
                                    },
                                    {
                                        type: 'tel',
                                        id: 'tel',
                                        name: 'tel',
                                        placeholder: 'tel',
                                        hasErrors: false,
                                        value: user ? user.tel : '',
                                        updated: false,
                                        icon: 'fas fa-mobile-alt'
                                    },
                                    {
                                        type: 'text',
                                        id: 'skype',
                                        name: 'skype',
                                        placeholder: 'skype',
                                        hasErrors: false,
                                        value: user ? user.skype : '',
                                        updated: false,
                                        icon: 'fab fa-skype'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        return formFields;
    }

    getDocFormFields(name, tags, teacher, action) {
        const { translate } = this.state;

        // === Need to move this to json file
        return [
            {
                type: 'text',
                name: 'name',
                id: 'name',
                placeholder: translate('title'),
                value: name,
                required: true,
                updated: false
            },
            {
                type: 'itemList',
                name: 'tags',
                id: 'tags',
                placeholder: translate('tags'),
                value: tags,
                updated: false
            },
            {
                type: 'block',
                heading: translate('teachers'),
                id: 'teacher_block',
                children: [
                    {
                        type: 'userPicker',
                        name: 'userPicker',
                        placeholder: translate('select_teacher'),
                        id: 'teacher',
                        value: teacher,
                        updated: false,
                        multiple: true
                    }
                ]
            },
            {
                type: 'submit',
                name: action,
                id: 'upload'
            }
        ];
    }
}
