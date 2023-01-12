// According to https://pdfmake.github.io/docs/0.1/document-definition-object/columns/
import { isURL, getPlainCredential, getCredentialValue } from './utils';

function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      if (!url) resolve(undefined);
      if (url.startsWith('data:image')) resolve(url);
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
async function getIssuer(issuer) {

    if (typeof issuer == 'object') {
        return issuer.name + ' (' + issuer.id + ')';
    }

    return issuer;

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
    meta: {
        fontSize: 8,
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
    const date = new Date();
    var issuerImage;
    try {
        issuerImage = await getBase64ImageFromURL(credential.issuer.image);
    } catch (error) {
        issuerImage = undefined;
    }
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
                    { text: credential.id, fontSize: 8, link: credential.id, color: '#848484', width: '*', margin: [ 0, 2, 4, 10 ] },
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
                            width: 80,
                            text: 'Issuer:',
                            style: 'meta',
                            bold: true
                        },
                        issuerImage ?
                        {
                            width: 'auto',
                            image: issuerImage,
                            fit: [16, 16],
                            margin: [ 0, -2, 4, 0 ]
                        } : 
                        {
                            width: 'auto',
                            text: '',
                        },
                        {
                            width: '*',
                            text: await getIssuer(credential.issuer),
                            style: 'meta'
                        },
                        {
                            width: 100,
                            text: credential.status,
                            alignment: 'center',
                            bold: true
                        },
                    ],
                margin: [0, 12, 0, 3]
            },
            {
                columns:
                    [   
                        {
                            width: 80,
                            text: 'Issuance date:',
                            style: 'meta',
                            bold: true
                        },
                        {
                            width: '*',
                            text: credential.issuanceDate,
                            style: 'meta'
                        },
                        {
                            width: 100,
                            text: `asserted by ${window.location.origin.replace(/^\/\/|^.*?:(\/\/)?/, '')}`,
                            alignment: 'center',
                            style: 'footer'
                        },
                    ]
            },
            {
                columns:
                    [   
                        {
                            width: '*',
                            text: '',
                            style: 'meta'
                        },
                        {
                            width: 100,
                            text: `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} ${date.getUTCHours()}:${date.getMinutes()}:${date.getSeconds()} UTC `,
                            alignment: 'center',
                            fontSize: 6,
                            style: 'footer',
                            margin: [0, 5]
                        },
                    ]
            },

            // Table of properties
            {
                layout: 'lightHorizontalLines', // optional
                margin: [0, 10, 0, 40],
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
                                isURL(getCredentialValue(credential.credentialSubject[key])) ? 
                                {text: getCredentialValue(credential.credentialSubject[key]), link: getCredentialValue(credential.credentialSubject[key]), color: 'blue', style: ['property_key', 'property_value']} :
                                {text: getCredentialValue(credential.credentialSubject[key]), style: ['property_key', 'property_value']}
                            ])))
                }
            },
            // Large QR code containing entire credential
            { qr: JSON.stringify(getPlainCredential(credential)), fit: '350', alignment: 'center', margin: [0, 5]},
            { text: 'Full Credential', fontSize: 16, alignment: 'center'},
        ],
        footer: {
            columns:
            [   
                {
                    width: 250,
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
