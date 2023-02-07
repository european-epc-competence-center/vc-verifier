[![Building All Containers](https://github.com/european-epc-competence-center/vc-verifier/actions/workflows/build-all.yml/badge.svg)](https://github.com/orgs/european-epc-competence-center/packages?repo_name=vc-verifier)

# VC Verifier

The [EECC Verifier](https://ssi.eecc.de/verifier/) for verifiable credentials provides a verification API as well as the corresponding UI. It's primary purpose is to aggregate data from various VCs and display them in a comprehensible manner as a product passport. [See here for an example.](https://ssi.eecc.de/verifier/#/verify?subjectId=https%3A%2F%2Fid.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234)

This tool uses the libraries by [Digital Bazaar, Inc.](https://github.com/digitalbazaar), in particular

- https://github.com/digitalbazaar/vc-js
- https://github.com/digitalbazaar/ed25519-signature-2020
- https://github.com/digitalbazaar/vc-revocation-list

in order to verify signatures of [W3C conformal verifiable credentials](https://www.w3.org/TR/vc-data-model/) in JSON-LD form.


## License

Copyright 2022 European EPC Competence Center GmbH (EECC). Corresponding Author: Christian Fries <christian.fries@eecc.de>

<a href="https://www.gnu.org/licenses/agpl-3.0.html">
<img alt="AGPLV3" style="border-width:0" src="https://www.gnu.org/graphics/agplv3-with-text-162x68.png" /><br />
</a>

All code published in this repository is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
</a>

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
