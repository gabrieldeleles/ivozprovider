import defaultEntityBehavior from '../DefaultEntityBehavior';
import Country from './Country';

const CountrySelectOptions = (callback: Function) => {

    defaultEntityBehavior.fetchFks(
        '/countries',
        ['id', 'name', 'countryCode'],
        (data:any) => {
            const options:any = {};
            for (const item of data) {
                options[item.id] = `${Country.toStr(item)} (${item.countryCode})`;
            }

            callback(options);
        }
    );
}

export default CountrySelectOptions;