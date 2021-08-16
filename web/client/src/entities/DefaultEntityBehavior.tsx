import * as React from 'react';
import EntityService from 'services/Entity/EntityService';
import FormFieldFactory from 'services/Form/FormFieldFactory';
import { useFormikType } from 'services/Form/types';
import ApiClient from "services/Api/ApiClient";
import { Grid, makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { PropertySpec, ScalarProperty } from 'services/Api/ParsedApiSpecInterface';
import { PropertiesList } from './EntityInterface';
import ViewFieldValue from 'services/Form/Field/ViewFieldValue';

export const initialValues = {};

export const validator = (values: any) => {

    return {};
}

export const marshaller = (values: any, properties: PropertiesList) => {

    for (const idx in values) {

        const property:any = properties[idx];

        if (property?.type === "boolean") {
            values[idx] = values[idx] === '0'
                ? false
                : true;

            continue;
        }

        if (property?.$ref && values[idx] === '') {
            values[idx] = null;

            continue;
        }

        if (values[idx] === '__null__') {
            values[idx] = null;
        }
    }

    return values;
}

export const unmarshaller = (row: any, properties: PropertiesList) => {

    const normalizedData:any = {};

    // eslint-disable-next-line
    const dateTimePattern = `^[0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$`;
    const dateTimeRegExp = new RegExp(dateTimePattern);

    for (const idx in row) {
        if (row[idx] == null) {

            // formik doesn't like null values
            const property = properties[idx];
            normalizedData[idx] = property?.null
                ? '__null__'
                : '';

        } else if (typeof row[idx] === 'object' && row[idx].id) {
            // flatten foreign keys
            normalizedData[idx] = row[idx].id;
        } else if (typeof row[idx] === 'string' && row[idx].match(dateTimeRegExp)) {
            // formik datetime format: "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS"
            normalizedData[idx] = row[idx].replace(' ', 'T');
        } else if (properties[idx] && (properties[idx] as ScalarProperty).type === "boolean") {
            normalizedData[idx] = row[idx] === true
                ? 1
                : 0;
        } else {
            normalizedData[idx] = row[idx];
        }
    }

    return normalizedData;
};

export const foreignKeyResolver = async (data: any, entityService: EntityService) => data;

export const foreignKeyGetter = async () => {
    return {};
};

export const columns = [];

export const properties = {};

export const acl = {
    create: true,
    read: true,
    update: true,
    delete: true,
};

export const ListDecorator = (props: any) => {

    const {field, row, property} = props;
    let value = row[field];

    if (property.component) {
        return (
            <property.component _context={'read'} {...row} />
        );
    }

    if (property.enum) {
        if (property.enum[value]) {
            value = property.enum[value];
        }
    }

    if (!value && property.null) {
        value = property.null;
    }

    return value !== null
        ? value
        : '';
}

export const RowIcons = (props:any) => {
    return (
        <React.Fragment />
    );
};

export type FieldsetGroups = {
    legend: string|React.ReactElement,
    fields: Array<string>
}

const useStyles = makeStyles((theme: any) => ({
    legend: {
        marginBottom: '40px',
        paddingBottom: '10px',
        borderBottom: '1px solid #aaa',
    },
    grid: {
        paddingLeft: '15px',
        marginBottom: '15px',
    },
    hidden: {
        display: 'none',
    },
    visible: {
        display: 'block',
    }
}));

const Form = (props: any) => {

    const { entityService, formik }:
          { entityService: EntityService, formik: useFormikType } = props;
    const { fkChoices } = props;

    const columns = entityService.getColumns();
    const columnNames = Object.keys(columns);

    let groups:Array<FieldsetGroups> = [];
    if (props.groups) {
        groups = props.groups;
    } else {
        groups.push({
            legend: "",
            fields: columnNames
        });
    }

    const classes = useStyles();

    let initialVisualToggles = entityService.getVisualToggles();
    const initialValues = formik.initialValues;
    for (const idx in initialValues) {
      initialVisualToggles = entityService.updateVisualToggle(
        idx,
        initialValues[idx],
        initialVisualToggles,
      );
    }

    const [visualToggles, setVisualToggles] = React.useState(initialVisualToggles);

    const formOnChangeHandler = (e: React.ChangeEvent<any>): void => {

        formik.handleChange(e);

        const { name, value} = e.target;
        const updatedVisualToggles = entityService.updateVisualToggle(
          name,
          value,
          {...visualToggles},
        );

        setVisualToggles(updatedVisualToggles);
    };

    const formFieldFactory = new FormFieldFactory(
        entityService,
        formik,
        formOnChangeHandler
    );

    return (
        <React.Fragment>
        {groups.map((group:FieldsetGroups, idx:number) => {

            const visible = group.fields.reduce(
                (acc:boolean, fld:string) => {
                    return acc || visualToggles[fld];
                },
                false
            );

            const className = visible
                ? classes.visible
                : classes.hidden;

            return (
                <div key={idx} className={className}>
                    <Typography variant="h6" color="inherit" gutterBottom  className={classes.legend}>
                        {group.legend}
                    </Typography>
                    <Grid container spacing={3} className={classes.grid}>
                        {group.fields.map((columnName:string, idx: number) => {

                            const choices = fkChoices
                                ? fkChoices[columnName]
                                : null;

                            const className = visualToggles[columnName]
                                ? classes.visible
                                : classes.hidden;

                            return (
                                <Grid item xs={12} md={6} lg={4} key={idx} className={className}>
                                    {formFieldFactory.getFormField(columnName, choices)}
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            );
        })}
        </React.Fragment>
    );
};


const View = (props: any) => {

    const { entityService, row }: { entityService: EntityService, row:any } = props;

    const columns = entityService.getColumns();
    const columnNames = Object.keys(columns);

    let groups:Array<FieldsetGroups> = [];
    if (props.groups) {
        groups = props.groups;
    } else {
        groups.push({
            legend: "",
            fields: columnNames
        });
    }

    const classes = useStyles();

    return (
        <React.Fragment>
        {groups.map((group:FieldsetGroups, idx:number) => {
            return (
                <div key={idx}>
                    <Typography variant="h6" color="inherit" gutterBottom  className={classes.legend}>
                        {group.legend}
                    </Typography>
                    <Grid container spacing={3} className={classes.grid}>
                        {group.fields.map((columnName:string, idx: number) => {

                            const properties = entityService.getProperties();
                            const property = (properties[columnName] as PropertySpec);
                            return (
                                <Grid item xs={12} md={6} lg={4} key={idx}>
                                    <ViewFieldValue property={property} values={row} columnName={columnName} />
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            );
        })}
        </React.Fragment>
    );
};

const fetchFks = (endpoint: string, properties: Array<string>, setter: Function) => {
    ApiClient.get(
        endpoint,
        {
            '_pagination': false,
            '_itemsPerPage': 100,
            '_properties': properties
        },
        async (data: any) => {
            setter(data);
        }
    );
}

const DefaultEntityBehavior = {
    initialValues,
    validator,
    marshaller,
    unmarshaller,
    foreignKeyResolver,
    foreignKeyGetter,
    columns,
    properties,
    acl,
    ListDecorator,
    toStr: (row:any) => (row.id || '[*]'),
    RowIcons,
    Form,
    View,
    fetchFks,
    defaultOrderBy: 'id',
};

export default DefaultEntityBehavior;
