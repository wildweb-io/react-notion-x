import CheckboxIcon from './type-checkbox';
import DateIcon from './type-date';
import EmailIcon from './type-email';
import FileIcon from './type-file';
import FormulaIcon from './type-formula';
import MultiSelectIcon from './type-multi-select';
import NumberIcon from './type-number';
import PersonIcon from './type-person';
import Person2Icon from './type-person-2';
import PhoneNumberIcon from './type-phone-number';
import RelationIcon from './type-relation';
import SelectIcon from './type-select';
import StatusIcon from './type-status';
import TextIcon from './type-text';
import TimestampIcon from './type-timestamp';
import TitleIcon from './type-title';
import UrlIcon from './type-url';
import type {PropertyType} from 'notion-types';
import type * as React from 'react';

type PropertyIconProps = {
	readonly className?: string;
	readonly type: PropertyType;
};

const iconMap = {
	checkbox: CheckboxIcon,
	created_by: Person2Icon,
	created_time: TimestampIcon,
	date: DateIcon,
	email: EmailIcon,
	file: FileIcon,
	formula: FormulaIcon,
	last_edited_by: Person2Icon,
	last_edited_time: TimestampIcon,
	multi_select: MultiSelectIcon,
	number: NumberIcon,
	person: PersonIcon,
	phone_number: PhoneNumberIcon,
	relation: RelationIcon,
	select: SelectIcon,
	status: StatusIcon,
	text: TextIcon,
	title: TitleIcon,
	url: UrlIcon,
};

export const PropertyIcon: React.FC<PropertyIconProps> = ({type, ...rest}) => {
	const icon = iconMap[type] as any;

	if (!icon) return null;

	return icon(rest);
};
