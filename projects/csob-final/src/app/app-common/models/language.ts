export class Language {
    constructor(
        public value: string,
        public text: string,
        public css: string,
        public cultureCode: string
    ) { }
}

export const  Languages = [
    /* Do not localize: */
    new Language('cs', 'Česky', 'cz-lang', 'cs-CZ'),
    new Language('en', 'English', 'en-lang', 'en-GB')
];



