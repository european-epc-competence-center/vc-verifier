// According to https://pdfmake.github.io/docs/0.1/document-definition-object/columns/

const styles = {
    property_key: {
      fontSize: 12,
      bold: true,
    },
    property_value: {
        bold: false,
        alignment: 'center'
      },
    property_header: {
        fontSize: 16,
        bold: true,
      }
};

const images = {
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQD3A0FDAAAAAElFTkSuQmCC'
}

export function credentialPDF(credential) {
    return {
        pageMargins: [ 60, 60, 60, 60 ],
        styles: styles,
        images: images,
        header: {
                columns:
                [   
                    {
                    width: 'auto',
                    text: 'W3C Verifiable Credential',
                    bold: true
                    },
                    {
                    width: '*',
                    text: ''
                    },
                    {
                    width: 'auto',
                    text: 'LOGO'
                    },
                ],
                margin: [10,5] },
        // watermark: { text: 'EECC', color: 'blue', opacity: 0.3, bold: true, italics: false },
        content: [
        
            // using a { text: '...' } object lets you set styling properties

            { text: [
                    credential.type[1],
                    ' future icon' 
                ],
                fontSize: 15, bold: true },
            { text: credential.id, link: credential.id, color: 'blue', margin: [0, 5] },

        
            // if you set the value of text to an array instead of a string, you'll be able
            // to style any part individually
            'Bulleted list example:',
            {

            },
            {
                layout: 'lightHorizontalLines', // optional
                margin: [0, 15],
                table: {
                  // headers are automatically repeated if the table spans over multiple pages
                  // you can declare how many rows should be treated as headers
                  headerRows: 1,
                  widths: [ 100, '*'],
          
                  body: [[{text: 'Key', style: 'property_header'}, {text: 'Value', style: 'property_header'}]]
                  .concat(Object.keys(credential.credentialSubject)
                  .map(key => ([
                                {text: key, style: 'property_key'},
                                {text: credential.credentialSubject[key], style: ['property_key', 'property_value']}
                            ])))
                }
            },
            { qr: JSON.stringify(credential), fit: '300'},
        ],
        footer: {
            columns:
            [   
                {
                width: '*',
                text: 'logo',
                alignment: 'center'
                },
            ],
            margin: [10,5]
        }
    };
}
