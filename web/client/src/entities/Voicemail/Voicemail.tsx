import VoicemailIcon from '@mui/icons-material/Voicemail';
import EntityInterface, { ChildDecoratorType } from 'lib/entities/EntityInterface';
import _ from 'lib/services/translations/translate';
import defaultEntityBehavior from 'lib/entities/DefaultEntityBehavior';
import Form from './Form';
import { VoicemailProperties } from './VoicemailProperties';
import { EntityValues } from 'lib/services/entity/EntityService';
import selectOptions from './SelectOptions';
import DefaultEntityBehavior from 'lib/entities/DefaultEntityBehavior';

const properties: VoicemailProperties = {
    'enabled': {
        label: _('Enabled'),
        enum: {
            '0': _("No"),
            '1': _("Yes"),
        },
        default: '1',
    },
    'name': {
        label: _('Name'),
        required: true,
    },
    'sendMail': {
        label: _('Voicemail send mail'),
        enum: {
            '0': _("No"),
            '1': _("Yes"),
        },
        default: '1',
        visualToggle: {
            '0': {
                show: [],
                hide: ['attachSound', 'email'],
            },
            '1': {
                show: ['attachSound', 'email'],
                hide: [],
            }
        }
    },
    'email': {
        label: _('Email'),
        required: true,
    },
    'attachSound': {
        label: _('Voicemail attach sound'),
        enum: {
            '0': _("No"),
            '1': _("Yes"),
        },
        default: '1',
    },
    'locution': {
        label: _('Locution'),
        null: _("Unassigned"),
        default: '__null__',
    },
};

const columns = [
    'enabled',
    'name',
    'email',
];

export const ChildDecorator: ChildDecoratorType = (props) => {

    const { routeMapItem, row } = props;

    if (routeMapItem.entity.iden === Voicemail.iden) {

        const isDeletePath = routeMapItem.route === `${Voicemail.path}/:id`;
        const allowDelete = row.user === null;
        if (isDeletePath && !allowDelete) {
            return null;
        }
    }

    return DefaultEntityBehavior.ChildDecorator(props);
}

const Voicemail: EntityInterface = {
    ...defaultEntityBehavior,
    icon: VoicemailIcon,
    iden: 'Voicemail',
    title: _('Voicemail', { count: 2 }),
    path: '/voicemails',
    toStr: (row: EntityValues) => (row.name as string || ''),
    properties,
    columns,
    Form,
    ChildDecorator,
    selectOptions: (props, customProps) => { return selectOptions(props, customProps); },
};

export default Voicemail;