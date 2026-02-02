import { jest } from '@jest/globals'

// Set environment variable for GS1 Global DID used in tests
process.env.GS1_GLOBAL_DID = "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/09510010000002
const validKeyCredentialAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkjZXBjaXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiS2V5Q3JlZGVudGlhbCJdLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJuYW1lIjoiVXRvcGlhIENvbXBhbnkifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvMDEvMDA5NTEwMDAwMDAwMDUiLCJleHRlbmRzQ3JlZGVudGlhbCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX3ByZWZpeC8wOTUxMDAifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9rZXkvMDEvMDA5NTEwMDAwMDAwMDUiLCJ2YWxpZEZyb20iOiIyMDI2LTAxLTE0VDEyOjEwOjUyWiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi82YTljOTk4Yi1jODFjLTQ4ZWMtYWNhNS04MmNlMjRkYTNlN2YjNDIwODUiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiI0MjA4NSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNmE5Yzk5OGItYzgxYy00OGVjLWFjYTUtODJjZTI0ZGEzZTdmIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL2tleSIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2RlY2xhcmF0aW9uLWNvbnRleHQiLCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZXVyb3BlYW4tZXBjLWNvbXBldGVuY2UtY2VudGVyL2pzb25sZC1jb250ZXh0L3JlZnMvaGVhZHMvbWFpbi9jb250ZXh0L3JlbmRlci1tZXRob2QiXSwibmFtZSI6IkdTMSBJRCBLZXkgQ3JlZGVudGlhbCIsInJlbmRlck1ldGhvZCI6W3sibmFtZSI6IlNWRyBmb3Igd2ViIGRpc3BsYXkiLCJyZW5kZXJTdWl0ZSI6InN2Zy1tdXN0YWNoZSIsInRlbXBsYXRlIjp7Im1lZGlhVHlwZSI6ImltYWdlL3N2Zyt4bWwiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUta2V5LXRlbXBsYXRlLnN2ZyJ9LCJ0eXBlIjoiVGVtcGxhdGVSZW5kZXJNZXRob2QifV0sImRlc2NyaXB0aW9uIjoiRGVjbGFyZXMgdGhlIGNyeXB0b2dyYXBoaWMga2V5IGFzc29jaWF0ZWQgd2l0aCBhIEdTMSBpZGVudGlmaWVyLCBlbmFibGluZyBzZWN1cmUgZGlnaXRhbCBzaWduYXR1cmVzIGFuZCB2ZXJpZmljYXRpb24gb2YgR1MxLXJlbGF0ZWQgdHJhbnNhY3Rpb25zLiBUaGlzIGNyZWRlbnRpYWwgZXh0ZW5kcyBmcm9tIGEgQ29tcGFueSBQcmVmaXggTGljZW5zZSBhbmQgYmluZHMgYSBzcGVjaWZpYyBjcnlwdG9ncmFwaGljIGtleSB0byBhIEdTMSBpZGVudGlmaWVyLCBlbnN1cmluZyB0aGUgYXV0aGVudGljaXR5IGFuZCBpbnRlZ3JpdHkgb2YgZGF0YSBhc3NvY2lhdGVkIHdpdGggcHJvZHVjdHMsIGxvY2F0aW9ucywgb3IgZW50aXRpZXMgaWRlbnRpZmllZCBieSBHUzEgc3RhbmRhcmRzLiIsImlhdCI6MTc2ODM5MjY3M30.fh0LhblSMES4U23JQ_jpsK3cdo5Cef-QVCZSLLfU-Pv-Pi1WyEaMPyDmmc1HfoS238wtZXhw8R6dXvQrhpWCyw"
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001
const validCompanyPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjcCIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxQ29tcGFueVByZWZpeExpY2Vuc2VDcmVkZW50aWFsIl0sImlzc3VlciI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwibmFtZSI6IkdTMSBVdG9waWEifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJhbHRlcm5hdGl2ZUxpY2Vuc2VWYWx1ZSI6Ijk1MTAwIiwiZXh0ZW5kc0NyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9wcmVmaXgvMDk1MSIsImxpY2Vuc2VWYWx1ZSI6IjA5NTEwMCIsIm9yZ2FuaXphdGlvbiI6eyJnczE6cGFydHlHTE4iOiIwOTUxMDAwMDAwMDA1IiwiZ3MxOm9yZ2FuaXphdGlvbk5hbWUiOiJVdG9waWEgQ29tcGFueSJ9fSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9wcmVmaXgvMDk1MTAwIiwidmFsaWRGcm9tIjoiMjAyNi0wMi0wMlQxNDowNzo1NloiLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vOWJkNzQ5MDYtZWJhOS00Mzc1LThlMTItYzI4MmI3ZDk0YmRhIzM4NDE3IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3RFbnRyeSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwic3RhdHVzTGlzdEluZGV4IjoiMzg0MTciLCJzdGF0dXNMaXN0Q3JlZGVudGlhbCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzliZDc0OTA2LWViYTktNDM3NS04ZTEyLWMyODJiN2Q5NGJkYSJ9LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9pZC5nczEub3JnL3ZjL3NjaGVtYS92MS9jb21wYW55cHJlZml4IiwidHlwZSI6Ikpzb25TY2hlbWEifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnL25zL2NyZWRlbnRpYWxzL3YyIiwiaHR0cHM6Ly9yZWYuZ3MxLm9yZy9nczEvdmMvbGljZW5zZS1jb250ZXh0IiwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2V1cm9wZWFuLWVwYy1jb21wZXRlbmNlLWNlbnRlci9qc29ubGQtY29udGV4dC9yZWZzL2hlYWRzL21haW4vY29udGV4dC9yZW5kZXItbWV0aG9kIl0sImRlc2NyaXB0aW9uIjoiQXV0aG9yaXplcyBhIG1lbWJlciBjb21wYW55IHRvIHVzZSBhIHNwZWNpZmljIEdTMSBDb21wYW55IFByZWZpeCBmb3IgY3JlYXRpbmcgZ2xvYmFsbHkgdW5pcXVlIHByb2R1Y3QgaWRlbnRpZmllcnMuIElzc3VlZCBieSBhIE1lbWJlciBPcmdhbml6YXRpb24gdG8gY29tcGFuaWVzIHdpdGhpbiB0aGVpciByZWdpb24sIHRoaXMgY3JlZGVudGlhbCBleHRlbmRzIGZyb20gYSBHUzEgUHJlZml4IExpY2Vuc2UgYW5kIGVuYWJsZXMgdGhlIGNvbXBhbnkgdG8gZ2VuZXJhdGUgR1RJTnMsIEdMTnMsIGFuZCBvdGhlciBHUzEgaWRlbnRpZmljYXRpb24ga2V5cyBmb3IgdGhlaXIgcHJvZHVjdHMsIGxvY2F0aW9ucywgYW5kIGJ1c2luZXNzIGVudGl0aWVzLiBFc3NlbnRpYWwgZm9yIHN1cHBseSBjaGFpbiB0cmFjZWFiaWxpdHkgYW5kIGdsb2JhbCBjb21tZXJjZS4iLCJyZW5kZXJNZXRob2QiOlt7Im5hbWUiOiJTVkcgZm9yIHdlYiBkaXNwbGF5IiwidHlwZSI6IlRlbXBsYXRlUmVuZGVyTWV0aG9kIiwidGVtcGxhdGUiOnsiaWQiOiJodHRwczovL2dzMS5naXRodWIuaW8vR1MxRGlnaXRhbExpY2Vuc2VzL3RlbXBsYXRlcy9nczEtc2FtcGxlLWxpY2Vuc2UtdGVtcGxhdGUuc3ZnIiwibWVkaWFUeXBlIjoiaW1hZ2Uvc3ZnK3htbCJ9LCJyZW5kZXJTdWl0ZSI6InN2Zy1tdXN0YWNoZSJ9XSwibmFtZSI6IkdTMSBDb21wYW55IFByZWZpeCBMaWNlbnNlIiwiaWF0IjoxNzcwMDQxMzE2fQ.hh6T7Z_LECOPjHcGpZTwKmM8yWN8gwehFki2293YX0BbV84ATze3NfEh_GBGSo9LhSqJjankh7ACjQ6_4gZopg";
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951
const validPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNwcmVmaXgyIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxUHJlZml4TGljZW5zZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwiYWx0ZXJuYXRpdmVMaWNlbnNlVmFsdWUiOiI5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDAwMDAwMDUiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IkdTMSBVdG9waWEifX0sImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJ2YWxpZEZyb20iOiIyMDI2LTAyLTAyVDE0OjA5OjUxWiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9kYTgwM2EyOC0zNmYzLTQ4MGMtOTYxNS05MmQwMDI0NTdlMTgjMTEyMTUzIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3RFbnRyeSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwic3RhdHVzTGlzdEluZGV4IjoiMTEyMTUzIiwic3RhdHVzTGlzdENyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9kYTgwM2EyOC0zNmYzLTQ4MGMtOTYxNS05MmQwMDI0NTdlMTgifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vaWQuZ3MxLm9yZy92Yy9zY2hlbWEvdjEvcHJlZml4IiwidHlwZSI6Ikpzb25TY2hlbWEifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnL25zL2NyZWRlbnRpYWxzL3YyIiwiaHR0cHM6Ly9yZWYuZ3MxLm9yZy9nczEvdmMvbGljZW5zZS1jb250ZXh0IiwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2V1cm9wZWFuLWVwYy1jb21wZXRlbmNlLWNlbnRlci9qc29ubGQtY29udGV4dC9yZWZzL2hlYWRzL21haW4vY29udGV4dC9yZW5kZXItbWV0aG9kIl0sImRlc2NyaXB0aW9uIjoiVmVyaWZpZXMgdGhlIGF1dGhvcml6ZWQgYXNzaWdubWVudCBvZiBhIEdTMSBwcmVmaXggdG8gYSBNZW1iZXIgT3JnYW5pemF0aW9uIGJ5IEdTMSBHbG9iYWwuIFRoaXMgY3JlZGVudGlhbCBlc3RhYmxpc2hlcyB0aGUgZm91bmRhdGlvbmFsIGF1dGhvcml0eSB0aGF0IGVuYWJsZXMgdGhlIE1lbWJlciBPcmdhbml6YXRpb24gdG8gaXNzdWUgQ29tcGFueSBQcmVmaXggTGljZW5zZXMgdG8gbWVtYmVyIGNvbXBhbmllcyB3aXRoaW4gdGhlaXIgZ2VvZ3JhcGhpYyByZWdpb24gb3IgbWFya2V0IHNlY3Rvci4gVGhlIHByZWZpeCBmb3JtcyB0aGUgYmFzaXMgZm9yIGNyZWF0aW5nIGdsb2JhbGx5IHVuaXF1ZSBpZGVudGlmaWVycyBpbiB0aGUgR1MxIHN5c3RlbS4iLCJyZW5kZXJNZXRob2QiOlt7Im5hbWUiOiJTVkcgZm9yIHdlYiBkaXNwbGF5IiwidHlwZSI6IlRlbXBsYXRlUmVuZGVyTWV0aG9kIiwidGVtcGxhdGUiOnsiaWQiOiJodHRwczovL2dzMS5naXRodWIuaW8vR1MxRGlnaXRhbExpY2Vuc2VzL3RlbXBsYXRlcy9nczEtc2FtcGxlLWxpY2Vuc2UtdGVtcGxhdGUuc3ZnIiwibWVkaWFUeXBlIjoiaW1hZ2Uvc3ZnK3htbCJ9LCJyZW5kZXJTdWl0ZSI6InN2Zy1tdXN0YWNoZSJ9XSwibmFtZSI6IkdTMSBQcmVmaXggTGljZW5zZSIsImlhdCI6MTc3MDA0MTQ0N30.enix2xsZ_R3u5C_t01MHkgmjrHKtUgRUwgN_TpH1GI9D-ALbqo-pL4Zpsgdx6vBFW6D7TvDaUOysxZ3CwvbmDg";

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/c0470b49-d264-4a84-9cf4-267b1676e09c
const keyCredentialStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkjZXBjaXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOnV0b3BpYV9jb21wYW55IiwibmFtZSI6IlV0b3BpYSBDb21wYW55In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNmE5Yzk5OGItYzgxYy00OGVjLWFjYTUtODJjZTI0ZGEzZTdmI2xpc3QiLCJlbmNvZGVkTGlzdCI6Ikg0c0lBQUFBQUFBQV8tM0JNUUVBQUFEQ29QVlBiUXdmb0FBQUFBQUFBQUFBQUFBQUFBQUFBSUMzQVliU1ZLc0FRQUFBIiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdCJ9LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzZhOWM5OThiLWM4MWMtNDhlYy1hY2E1LTgyY2UyNGRhM2U3ZiIsIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy9zdGF0dXMvdjEiXSwiaWF0IjoxNzY4MzkyNjcyfQ.YMou1fl8Zw7zzRC4s0pSb_LKs2xpuv5P_iz-6ZkjZ2k-J0q6dM9gbB8v72PH-gy2PWpoXitYLCqEbwYQ3k4Ntg";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/68ab4e25-de1e-4d06-b6ad-c0ec5d5c425b
const companyPrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjcCIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV91dG9waWEiLCJuYW1lIjoiR1MxIFV0b3BpYSJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzliZDc0OTA2LWViYTktNDM3NS04ZTEyLWMyODJiN2Q5NGJkYSNsaXN0IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi85YmQ3NDkwNi1lYmE5LTQzNzUtOGUxMi1jMjgyYjdkOTRiZGEiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc3MDA0MTMxNX0.ppJCFzmK_dChb8SpJrPq1y4Rxzoum-Sq1q3C02XZcMoantnKmjfU4f3IJ-HmW0Zn3Clmn9N_RtyCFT2x2N2clQ";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9e859997-d387-4654-8d5e-7d35da1c7c47
const gs1PrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNwcmVmaXgyIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uL2RhODAzYTI4LTM2ZjMtNDgwYy05NjE1LTkyZDAwMjQ1N2UxOCNsaXN0IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9kYTgwM2EyOC0zNmYzLTQ4MGMtOTYxNS05MmQwMDI0NTdlMTgiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2OTE1NjMxMX0.qRduBF-pn-HRUnY2ThhXCsrYRXEVVFCYUxm_r_q9c8Ofgm4vI7EDtQ9ASgwZ1V8F_YmwkRl2lfgTm8wLKITriw";


const did_gs1_company: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#epcis",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
            "publicKeyJwk": {
              "key_ops": [
                "verify"
              ],
              "ext": true,
              "kty": "EC",
              "x": "YxFJ3rXlqGNgzQX3CLP0G2_EbxV7hFe43MTzbpRsqbU",
              "y": "x3YLvwQFTfV1IxgX4Cl-u2pVy3dUNot4T_xbU1_Jwek",
              "crv": "P-256"
            }
          }
    ],
    "controller": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company"
    ],
    "@context": [
        "https://www.w3.org/ns/did/v1"
    ],
    "assertionMethod": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#epcis"
    ]
}

const did_gs1_utopia: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#cp",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
            "publicKeyJwk": {
              "key_ops": [
                "verify"
              ],
              "ext": true,
              "kty": "EC",
              "x": "YUh3WMk4tlCVYoKzHOjIte8nnTy9PRYs_8LFb-_6lVY",
              "y": "XYer6GEJ5-ggAUdBfnU580Ny14caOPuTWZIzxq1hTBU",
              "crv": "P-256"
            }
          }
    ],
    "controller": [
      "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia"
    ],
    "@context": [
      "https://www.w3.org/ns/did/v1"
    ],
    "assertionMethod": [
      "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#cp"
    ],
    "authentication": [
      "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#cp"
    ]
  }

const did_gs1_global: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefix2",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
              "key_ops": [
                "verify"
              ],
              "ext": true,
              "kty": "EC",
              "x": "DLarVWyiHqY4gA8MHVHb8pTU2856lhBQ1FwQQjgJDwI",
              "y": "EPk6QmXw7uIXb2cZrtnrwlY-DupKj_-5TFLk6r2hfYc",
              "crv": "P-256"
            }
          }
    ],
    "controller": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global"
    ],
    "@context": [
        "https://www.w3.org/ns/did/v1"
    ],
    "assertionMethod": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefix2"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefix2"
    ]
}

function resolveDIDFragment(didDocument: any, fragmentId: string) {
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) =>
        vm.id.endsWith(`#${fragmentId}`)
    );

    if (verificationMethod) {
        return verificationMethod;
    }

    return didDocument;
}

await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/00951000000005") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validKeyCredentialAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/095100") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validCompanyPrefixLicenseAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validPrefixLicenseAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a9c998b-c81c-48ec-aca5-82ce24da3e7f") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: keyCredentialStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9bd74906-eba9-4375-8e12-c282b7d94bda") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/da803a28-36f3-480c-9615-92d002457e18") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1PrefixLicenseStatusListAsJwt
            };
        }

        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');

            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_company, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_company
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_utopia, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_utopia
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_global, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_global
                    };
                }
            }
        }

        // For unmocked URLs, log and throw error to identify what needs mocking
        console.log(`No mock available for URL: ${url}`);
        throw new Error(`Unmocked document loader URL called: ${url}`);
    })
}));

// Import modules after mocking
import request from "supertest";
// Global server variable
let server: any;

describe("Verifier API Test for JWT Credentials", () => {

    beforeAll(async () => {
        // Import server after mocks are set up
        const { default: serverModule } = await import("../src/index");
        server = serverModule;
    });

    afterAll(done => {
        if (server) {
            server.close();
        }
        done();
    });

    test("Verify valid GS1 Prefix Credential as JWT with GS1 endpoint", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([validPrefixLicenseAsJwt]);
        console.log('Response:', JSON.stringify(res.body, null, 2));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });

    test("Verify valid GS1 Company Prefix Credential as JWT with GS1 endpoint", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([validCompanyPrefixLicenseAsJwt]);
        console.log('Response:', JSON.stringify(res.body, null, 2));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });

    test("Verify valid GS1 Key Credential as JWT with GS1 endpoint", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([validKeyCredentialAsJwt]);
        console.log('Response:', JSON.stringify(res.body, null, 2));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0].verified).toBe(true);
    });

});
