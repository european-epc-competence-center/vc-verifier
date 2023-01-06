// According to https://pdfmake.github.io/docs/0.1/document-definition-object/columns/
import { isURL } from './utils';

function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
    
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
    
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
    
        var dataURL = canvas.toDataURL("image/png");
    
        resolve(dataURL);
      };
    
      img.onerror = error => {
        reject(error);
      };
    
      img.src = url;
});
}

async function getStatusImage(credential) {
    if (credential.revoked) return await getBase64ImageFromURL(require('@/assets/img/sign-turn-left-fill.png'));
    if (!credential.verified) return await getBase64ImageFromURL(require('@/assets/img/x-circle-fill.png'));
    return await getBase64ImageFromURL(require('@/assets/img/shield-fill-check.png'));
}

const styles = {
    footer: {
        fontSize: 8,
        color: '#848484'
    },
    property_key: {
      fontSize: 12,
      bold: true,
    },
    property_value: {
        bold: false,
        // alignment: 'center'
      },
    property_header: {
        fontSize: 16,
        bold: true,
      }
};

export async function credentialPDF(credential) {
    return {
        pageMargins: [ 50, 50, 50, 50 ],
        styles: styles,
        // header
        /*header: {
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
                margin: [10,5] },*/
        // Watermark
        // watermark: { text: 'EECC', color: 'blue', opacity: 0.3, bold: true, italics: false },
        content: [
        
            // using a { text: '...' } object lets you set styling properties

            { text: credential.type[1], fontSize: 24, bold: true, color: '#6795d0' },
            {
                columns: [
                    { text: credential.id, fontSize: 8, link: credential.id, color: '#848484', width: '*', margin: [ 4, 2, 4, 5 ] },
                    { qr: credential.id , fit: '50', margin: [25, -22], width: '180'},
                ]
            },
            {
                image: await getStatusImage(credential),
                fit: [40, 40],
                alignment: 'right',
                margin: [ 30, -40, 0, 0 ]
            },
            {
                columns:
                    [   
                        {
                            width: '*',
                            text: '',
                        },
                        {
                            width: 100,
                            text: credential.status,
                            alignment: 'center',
                            bold: true
                        },
                    ],
                margin: [0, 3]
            },
            {
                columns:
                    [   
                        {
                            width: '*',
                            text: '',
                        },
                        {
                            width: 100,
                            text: `asserted by ${window.location.origin}`,
                            alignment: 'center',
                            style: 'footer'
                        },
                    ]
            },

            // Table of properties
            {
                layout: 'lightHorizontalLines', // optional
                margin: [0, 5, 0, 40],
                table: {
                  // headers are automatically repeated if the table spans over multiple pages
                  // you can declare how many rows should be treated as headers
                  headerRows: 1,
                  widths: [ 120, '*'],
          
                  body: [[{text: 'Key', style: 'property_header'}, {text: 'Value', style: 'property_header'}]]
                  .concat(Object.keys(credential.credentialSubject)
                  .map(key => ([
                                {text: key, style: 'property_key'},
                                // display value as url if possible
                                isURL(credential.credentialSubject[key]) ? 
                                {text: credential.credentialSubject[key], link: credential.credentialSubject[key], color: 'blue', style: ['property_key', 'property_value']} :
                                {text: credential.credentialSubject[key], style: ['property_key', 'property_value']}
                            ])))
                }
            },
            // Large QR code containing entire credential
            { qr: JSON.stringify(credential), fit: '350', alignment: 'center', margin: [0, 5]},
            { text: 'Full credential', fontSize: 16, alignment: 'center'},
        ],
        footer: {
            columns:
            [   
                {
                    width: '*',
                    text: 'Generated by the ',
                    alignment: 'right',
                    margin: [4,16],
                    style: 'footer'
                },
                {
                width: 'auto',
                image: await getBase64ImageFromURL(require('@/assets/img/logo.png')),
                fit: [50, 50],
                alignment: 'center'
                },
                {
                    width: 'auto',
                    text: 'credential verifier',
                    margin: [0,16],
                    style: 'footer'
                },
                { qr: 'https://ssi.eecc.de/verifier', fit: '25', width: '*', margin: [4,8]}
            ],
            margin: [10,5]
        }
    };
}
