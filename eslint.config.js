import {nivalis} from '@nivalis/eslint-config';

const config = nivalis([{ignores: ['build/**/*']}], {
	typescriptTypecheck: false,
});

export default config;
