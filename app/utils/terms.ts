export type TermsSection = { h: string; p: string[] }

export const terms: Record<'es' | 'en', { title: string; updated: string; intro: string; sections: TermsSection[]; note: string }> = {
  es: {
    title: 'Términos de Servicio',
    updated: 'Última actualización: octubre de 2026',
    intro:
      'Lee esto antes de usar SS. Al usar la aplicación aceptas estos términos en su totalidad. Si no estás de acuerdo, no la uses.',
    sections: [
      {
        h: 'Objeto',
        p: [
          'SS — Servicio de Secretos («el Software») es una aplicación de código abierto que se ejecuta íntegramente en el navegador del usuario. No existen servidores del proveedor: no se recopilan, transmiten ni almacenan datos, claves, contactos ni mensajes. El proveedor no puede leer, recuperar ni modificar nada de lo que hagas con el Software.',
          'El Software se entrega «tal cual», sin garantía de ningún tipo, bajo la licencia AGPL-3.0-only.'
        ]
      },
      {
        h: 'Uso autorizado',
        p: [
          'El Software está autorizado exclusivamente para compartir secretos —contraseñas, credenciales, información sensible o resguardada por ley, y comunicaciones que legítimamente puedan cifrarse— entre personas que tienen derecho a conocerlos, y siempre que ese uso no sea contrario a la ley ni a derechos de terceros.'
        ]
      },
      {
        h: 'Usos prohibidos',
        p: [
          'Queda estrictamente prohibido usar el Software para: (a) cualquier actividad ilícita; (b) vulnerar derechos de terceros, incluidos la intimidad, el honor, la propiedad o la seguridad; (c) difundir contenido ilegal o dañino; (d) obstruir, eludir o engañar a autoridades o a investigaciones legítimas; (e) suplantar identidad o inducir a error; o (f) cualquier fin distinto del descrito en la sección anterior.'
        ]
      },
      {
        h: 'Responsabilidad exclusiva del usuario',
        p: [
          'El usuario es el único responsable del uso que haga del Software, de las claves y certificados que genere, de los mensajes que cifre y de los enlaces que comparta.',
          'La clave privada se guarda únicamente en su dispositivo. Si la pierde, nadie —ni el proveedor— puede recuperarla ni recuperar los mensajes asociados. El usuario es también el único responsable de verificar la identidad de sus contactos antes de enviarles información.'
        ]
      },
      {
        h: 'Exención de responsabilidad',
        p: [
          'En la máxima medida permitida por la ley aplicable, los autores, colaboradores y distribuidores del Software quedan eximidos de toda responsabilidad por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos, lucro cesante, pérdida de datos o de claves, interrupción del servicio, daño reputacional o cualquier otro perjuicio derivado de: (a) el uso o la imposibilidad de usar el Software; (b) el uso indebido, ilegítimo, negligente o fraudulento por parte de cualquier persona; (c) la pérdida, robo o mal manejo de claves; (d) la interceptación, alteración o divulgación de información por causas ajenas al Software; o (e) el incumplimiento de estas condiciones por parte del usuario.',
          'El usuario asume todos los riesgos y libera al proveedor de cualquier reclamación propia o de terceros relacionada con el uso del Software.'
        ]
      },
      {
        h: 'Sin garantías',
        p: [
          'El Software se proporciona «tal cual» y «según disponibilidad», sin garantías expresas ni implícitas, incluidas —sin limitación— las de comerciabilidad, idoneidad para un fin particular, seguridad, ausencia de errores o no infracción.',
          'La criptografía es una herramienta, no una promesa: ningún cifrado es invulnerable y ninguna implementación está libre de fallos. No uses este Software como única protección de información cuya pérdida o divulgación te cause un daño grave.'
        ]
      },
      {
        h: 'Cumplimiento legal',
        p: [
          'Es responsabilidad exclusiva del usuario asegurarse de que su uso cumple las leyes y regulaciones aplicables en su jurisdicción, incluidas las relativas a criptografía, protección de datos personales y secreto de las comunicaciones.',
          'El Software puede no ser apropiado ni legal en todas las jurisdicciones, o estar restringido para ciertos usos o personas. El usuario debe abstenerse de usarlo donde ello sea contrario a la ley.'
        ]
      },
      {
        h: 'Aceptación',
        p: [
          'Al usar el Software, el usuario declara haber leído, entendido y aceptado estos Términos. Si no está de acuerdo, debe abstenerse de utilizarlo.',
          'Estos Términos pueden actualizarse; la versión vigente es la publicada en esta página.'
        ]
      },
      {
        h: 'Licencia',
        p: [
          'El código fuente se distribuye bajo AGPL-3.0-only. Esa licencia incluye su propia limitación de responsabilidad y de garantías, que complementa —y no sustituye— a estos Términos.'
        ]
      }
    ],
    note: 'Este documento no constituye asesoría legal y no reemplaza las normas aplicables en tu jurisdicción.'
  },
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: October 2026',
    intro:
      'Read this before using SS. By using the application you accept these terms in full. If you disagree, do not use it.',
    sections: [
      {
        h: 'Purpose',
        p: [
          'SS — Secrets Service ("the Software") is an open-source application that runs entirely in the user’s browser. There are no provider servers: no data, keys, contacts or messages are collected, transmitted or stored. The provider cannot read, recover or modify anything you do with the Software.',
          'The Software is provided "as is", without warranty of any kind, under the AGPL-3.0-only license.'
        ]
      },
      {
        h: 'Authorized use',
        p: [
          'The Software is authorized exclusively for sharing secrets —passwords, credentials, sensitive information or information protected by law, and communications that may lawfully be encrypted— between people entitled to know them, and only where such use is not contrary to law or to the rights of third parties.'
        ]
      },
      {
        h: 'Prohibited uses',
        p: [
          'It is strictly forbidden to use the Software for: (a) any unlawful activity; (b) violating the rights of others, including privacy, reputation, property or safety; (c) disseminating illegal or harmful content; (d) obstructing, evading or misleading authorities or legitimate investigations; (e) impersonating or misleading others; or (f) any purpose other than the one described in the previous section.'
        ]
      },
      {
        h: 'User’s sole responsibility',
        p: [
          'The user is solely responsible for how they use the Software, for the keys and certificates they generate, for the messages they encrypt and for the links they share.',
          'The private key is kept only on their device. If it is lost, no one —including the provider— can recover it or the associated messages. The user is also solely responsible for verifying the identity of their contacts before sending them information.'
        ]
      },
      {
        h: 'Limitation of liability',
        p: [
          'To the maximum extent permitted by applicable law, the authors, contributors and distributors of the Software are released from all liability for direct, indirect, incidental, special, consequential or punitive damages, loss of profits, loss of data or keys, service interruption, reputational harm or any other damage arising from: (a) the use or inability to use the Software; (b) improper, unlawful, negligent or fraudulent use by any person; (c) loss, theft or mishandling of keys; (d) interception, alteration or disclosure of information for reasons beyond the Software; or (e) the user’s breach of these terms.',
          'The user assumes all risks and releases the provider from any claim, whether their own or a third party’s, related to use of the Software.'
        ]
      },
      {
        h: 'No warranty',
        p: [
          'The Software is provided "as is" and "as available", without express or implied warranties, including —without limitation— merchantability, fitness for a particular purpose, security, freedom from errors or non-infringement.',
          'Cryptography is a tool, not a promise: no encryption is invulnerable and no implementation is free of flaws. Do not use this Software as the sole protection for information whose loss or disclosure would cause you serious harm.'
        ]
      },
      {
        h: 'Legal compliance',
        p: [
          'It is the user’s sole responsibility to ensure their use complies with the laws and regulations applicable in their jurisdiction, including those relating to cryptography, personal data protection and the secrecy of communications.',
          'The Software may not be appropriate or lawful in every jurisdiction, or may be restricted for certain uses or persons. The user must refrain from using it where doing so would be contrary to law.'
        ]
      },
      {
        h: 'Acceptance',
        p: [
          'By using the Software, the user states they have read, understood and accepted these Terms. If they disagree, they must refrain from using it.',
          'These Terms may be updated; the version in force is the one published on this page.'
        ]
      },
      {
        h: 'License',
        p: [
          'The source code is distributed under AGPL-3.0-only. That license includes its own limitation of liability and warranty clauses, which supplement —and do not replace— these Terms.'
        ]
      }
    ],
    note: 'This document is not legal advice and does not replace the rules applicable in your jurisdiction.'
  }
}