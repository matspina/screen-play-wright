module.exports = {
	env: {
		es2021: true,
		node: true
	},
	extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint', 'prettier', 'import-helpers'],
	rules: {
		'no-param-reassign': 0,
		'no-underscore-dangle': 0,
		'max-classes-per-file': ['error', { ignoreExpressions: true }],
		'no-loop-func': 0,
		'import/no-dynamic-require': 0,
		'global-require': 0,
		'no-empty-pattern': 0,
		'no-plusplus': 0,
		'no-nested-ternary': 0,
		'no-await-in-loop': 0,
		'class-methods-use-this': 0,
		'consistent-return': 0,
		'dot-notation': 0,
		'prettier/prettier': 'error',
		'comma-dangle': ['error', 'never'],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		quotes: ['error', 'single', { avoidEscape: true }],
		semi: ['error', 'never'],
		'new-cap': ['error', { newIsCap: false }],
		'no-console': 0,
		'no-undef': 0,
		'no-tabs': 0,
		'no-use-before-define': 0,
		'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
		'max-len': ['error', { code: 180 }],
		complexity: ['error', { max: 12 }],
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
		'import-helpers/order-imports': [
			'error',
			{
				newlinesBetween: 'always',
				groups: [
					['module', '/^@playwright/'],
					['/^@abilities/', '/^@activity/', '/^@actors/', '/^@config/', '/^@utils/'],
					['/^@mocks/', '/^@page-objects/'],
					['/^@interactions/', '/^@questions/', '/^@tasks/'],
					['parent', 'sibling', 'index']
				],
				alphabetize: { order: 'asc', ignoreCase: true }
			}
		],
		'import/prefer-default-export': 'off'
	},
	settings: {
		'import/resolver': {
			typescript: {}
		}
	}
}
