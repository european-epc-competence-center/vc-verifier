import { jest } from '@jest/globals'

// Set environment variable for GS1 Global DID used in tests
process.env.GS1_GLOBAL_DID = "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/09510010000002
const validKeyCredentialAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkjZXBjaXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiS2V5Q3JlZGVudGlhbCJdLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJuYW1lIjoiVXRvcGlhIENvbXBhbnkifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvMDEvMDA5NTEwMDAwMDAwMDUiLCJleHRlbmRzQ3JlZGVudGlhbCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX3ByZWZpeC8wOTUxMDAifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9rZXkvMDEvMDA5NTEwMDAwMDAwMDUiLCJ2YWxpZEZyb20iOiIyMDI2LTAxLTE0VDEyOjEwOjUyWiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi82YTljOTk4Yi1jODFjLTQ4ZWMtYWNhNS04MmNlMjRkYTNlN2YjNDIwODUiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiI0MjA4NSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNmE5Yzk5OGItYzgxYy00OGVjLWFjYTUtODJjZTI0ZGEzZTdmIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL2tleSIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2RlY2xhcmF0aW9uLWNvbnRleHQiLCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZXVyb3BlYW4tZXBjLWNvbXBldGVuY2UtY2VudGVyL2pzb25sZC1jb250ZXh0L3JlZnMvaGVhZHMvbWFpbi9jb250ZXh0L3JlbmRlci1tZXRob2QiXSwibmFtZSI6IkdTMSBJRCBLZXkgQ3JlZGVudGlhbCIsInJlbmRlck1ldGhvZCI6W3sibmFtZSI6IlNWRyBmb3Igd2ViIGRpc3BsYXkiLCJyZW5kZXJTdWl0ZSI6InN2Zy1tdXN0YWNoZSIsInRlbXBsYXRlIjp7Im1lZGlhVHlwZSI6ImltYWdlL3N2Zyt4bWwiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUta2V5LXRlbXBsYXRlLnN2ZyJ9LCJ0eXBlIjoiVGVtcGxhdGVSZW5kZXJNZXRob2QifV0sImRlc2NyaXB0aW9uIjoiRGVjbGFyZXMgdGhlIGNyeXB0b2dyYXBoaWMga2V5IGFzc29jaWF0ZWQgd2l0aCBhIEdTMSBpZGVudGlmaWVyLCBlbmFibGluZyBzZWN1cmUgZGlnaXRhbCBzaWduYXR1cmVzIGFuZCB2ZXJpZmljYXRpb24gb2YgR1MxLXJlbGF0ZWQgdHJhbnNhY3Rpb25zLiBUaGlzIGNyZWRlbnRpYWwgZXh0ZW5kcyBmcm9tIGEgQ29tcGFueSBQcmVmaXggTGljZW5zZSBhbmQgYmluZHMgYSBzcGVjaWZpYyBjcnlwdG9ncmFwaGljIGtleSB0byBhIEdTMSBpZGVudGlmaWVyLCBlbnN1cmluZyB0aGUgYXV0aGVudGljaXR5IGFuZCBpbnRlZ3JpdHkgb2YgZGF0YSBhc3NvY2lhdGVkIHdpdGggcHJvZHVjdHMsIGxvY2F0aW9ucywgb3IgZW50aXRpZXMgaWRlbnRpZmllZCBieSBHUzEgc3RhbmRhcmRzLiIsImlhdCI6MTc2ODM5MjY3M30.fh0LhblSMES4U23JQ_jpsK3cdo5Cef-QVCZSLLfU-Pv-Pi1WyEaMPyDmmc1HfoS238wtZXhw8R6dXvQrhpWCyw"
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001
const validCompanyPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55UHJlZml4IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxQ29tcGFueVByZWZpeExpY2Vuc2VDcmVkZW50aWFsIl0sImlzc3VlciI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwibmFtZSI6IkdTMSBVdG9waWEifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJhbHRlcm5hdGl2ZUxpY2Vuc2VWYWx1ZSI6Ijk1MTAwIiwiZXh0ZW5kc0NyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9wcmVmaXgvMDk1MSIsImxpY2Vuc2VWYWx1ZSI6IjA5NTEwMCIsIm9yZ2FuaXphdGlvbiI6eyJnczE6cGFydHlHTE4iOiIwOTUxMDAwMDAwMDA1IiwiZ3MxOm9yZ2FuaXphdGlvbk5hbWUiOiJVdG9waWEgQ29tcGFueSJ9fSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9saWNlbnNlL2dzMV9wcmVmaXgvMDk1MTAwIiwidmFsaWRGcm9tIjoiMjAyNS0xMi0xN1QwODo0MjozMVoiLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vMzMxMTY1NWYtNzRkZi00Y2YzLTg3NzQtMDlkMTM0MzUxZTAwIzg2NzYiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiI4Njc2Iiwic3RhdHVzTGlzdENyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi8zMzExNjU1Zi03NGRmLTRjZjMtODc3NC0wOWQxMzQzNTFlMDAifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vaWQuZ3MxLm9yZy92Yy9zY2hlbWEvdjEvY29tcGFueXByZWZpeCIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCIsImh0dHBzOi8vdzNpZC5vcmcvdmMvcmVuZGVyLW1ldGhvZC92MSJdLCJuYW1lIjoiR1MxIENvbXBhbnkgUHJlZml4IExpY2Vuc2UiLCJyZW5kZXJNZXRob2QiOlt7Im5hbWUiOiJXZWIgRGlzcGxheSIsImNzczNNZWRpYVF1ZXJ5IjoiQG1lZGlhIChtaW4tYXNwZWN0LXJhdGlvOiAzLzEpIiwidHlwZSI6IlN2Z1JlbmRlcmluZ1RlbXBsYXRlMjAyMyIsImlkIjoiaHR0cHM6Ly9nczEuZ2l0aHViLmlvL0dTMURpZ2l0YWxMaWNlbnNlcy90ZW1wbGF0ZXMvZ3MxLXNhbXBsZS1saWNlbnNlLXRlbXBsYXRlLnN2ZyJ9XSwiZGVzY3JpcHRpb24iOiJBdXRob3JpemVzIGEgbWVtYmVyIGNvbXBhbnkgdG8gdXNlIGEgc3BlY2lmaWMgR1MxIENvbXBhbnkgUHJlZml4IGZvciBjcmVhdGluZyBnbG9iYWxseSB1bmlxdWUgcHJvZHVjdCBpZGVudGlmaWVycy4gSXNzdWVkIGJ5IGEgTWVtYmVyIE9yZ2FuaXphdGlvbiB0byBjb21wYW5pZXMgd2l0aGluIHRoZWlyIHJlZ2lvbiwgdGhpcyBjcmVkZW50aWFsIGV4dGVuZHMgZnJvbSBhIEdTMSBQcmVmaXggTGljZW5zZSBhbmQgZW5hYmxlcyB0aGUgY29tcGFueSB0byBnZW5lcmF0ZSBHVElOcywgR0xOcywgYW5kIG90aGVyIEdTMSBpZGVudGlmaWNhdGlvbiBrZXlzIGZvciB0aGVpciBwcm9kdWN0cywgbG9jYXRpb25zLCBhbmQgYnVzaW5lc3MgZW50aXRpZXMuIEVzc2VudGlhbCBmb3Igc3VwcGx5IGNoYWluIHRyYWNlYWJpbGl0eSBhbmQgZ2xvYmFsIGNvbW1lcmNlLiIsImlhdCI6MTc2NTk2MTEzNH0.3CE1oWsS913ZsA0rC5AlQx4KYeBlfBhTdP2Nnj1mCM-ssIeypxwu1ZaE_PLDf0Wzbdzue8VTQwC0YH608Ef0yw";
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951
const validPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNzZWN1cmUtcHJlZml4IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxUHJlZml4TGljZW5zZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwiYWx0ZXJuYXRpdmVMaWNlbnNlVmFsdWUiOiI5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDAwMDAwMDUiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IkdTMSBVdG9waWEifX0sImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJ2YWxpZEZyb20iOiIyMDI2LTAxLTA4VDEzOjM5OjQ4WiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi8yODFlZTBjYy03MjI1LTRiZDctYTc3MC0wOGI3NmFjZDNlNWUjMjkzMzYiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiIyOTMzNiIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vMjgxZWUwY2MtNzIyNS00YmQ3LWE3NzAtMDhiNzZhY2QzZTVlIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL3ByZWZpeCIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCIsImh0dHBzOi8vdzNpZC5vcmcvdmMvcmVuZGVyLW1ldGhvZC92MSJdLCJuYW1lIjoiR1MxIFByZWZpeCBMaWNlbnNlIiwiZGVzY3JpcHRpb24iOiJWZXJpZmllcyB0aGUgYXV0aG9yaXplZCBhc3NpZ25tZW50IG9mIGEgR1MxIHByZWZpeCB0byBhIE1lbWJlciBPcmdhbml6YXRpb24gYnkgR1MxIEdsb2JhbC4gVGhpcyBjcmVkZW50aWFsIGVzdGFibGlzaGVzIHRoZSBmb3VuZGF0aW9uYWwgYXV0aG9yaXR5IHRoYXQgZW5hYmxlcyB0aGUgTWVtYmVyIE9yZ2FuaXphdGlvbiB0byBpc3N1ZSBDb21wYW55IFByZWZpeCBMaWNlbnNlcyB0byBtZW1iZXIgY29tcGFuaWVzIHdpdGhpbiB0aGVpciBnZW9ncmFwaGljIHJlZ2lvbiBvciBtYXJrZXQgc2VjdG9yLiBUaGUgcHJlZml4IGZvcm1zIHRoZSBiYXNpcyBmb3IgY3JlYXRpbmcgZ2xvYmFsbHkgdW5pcXVlIGlkZW50aWZpZXJzIGluIHRoZSBHUzEgc3lzdGVtLiIsInJlbmRlck1ldGhvZCI6W3siY3NzM01lZGlhUXVlcnkiOiJAbWVkaWEgKG1pbi1hc3BlY3QtcmF0aW86IDMvMSkiLCJuYW1lIjoiV2ViIERpc3BsYXkiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUtbGljZW5zZS10ZW1wbGF0ZS5zdmciLCJ0eXBlIjoiU3ZnUmVuZGVyaW5nVGVtcGxhdGUyMDIzIn1dLCJpYXQiOjE3Njc4Nzk3MzN9.UcbDW-MYSOpHxcEU2rYSUpAcZDM0JazWIdliI4Cs7i7OYAuXWd1DayTwO4cZAamBqBUovJKwzK1gYKa_7InaaA";

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/c0470b49-d264-4a84-9cf4-267b1676e09c
const keyCredentialStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkjZXBjaXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOnV0b3BpYV9jb21wYW55IiwibmFtZSI6IlV0b3BpYSBDb21wYW55In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNmE5Yzk5OGItYzgxYy00OGVjLWFjYTUtODJjZTI0ZGEzZTdmI2xpc3QiLCJlbmNvZGVkTGlzdCI6Ikg0c0lBQUFBQUFBQV8tM0JNUUVBQUFEQ29QVlBiUXdmb0FBQUFBQUFBQUFBQUFBQUFBQUFBSUMzQVliU1ZLc0FRQUFBIiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdCJ9LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzZhOWM5OThiLWM4MWMtNDhlYy1hY2E1LTgyY2UyNGRhM2U3ZiIsIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy9zdGF0dXMvdjEiXSwiaWF0IjoxNzY4MzkyNjcyfQ.YMou1fl8Zw7zzRC4s0pSb_LKs2xpuv5P_iz-6ZkjZ2k-J0q6dM9gbB8v72PH-gy2PWpoXitYLCqEbwYQ3k4Ntg";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/68ab4e25-de1e-4d06-b6ad-c0ec5d5c425b
const companyPrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55UHJlZml4IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV91dG9waWEiLCJuYW1lIjoiR1MxIFV0b3BpYSJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzMzMTE2NTVmLTc0ZGYtNGNmMy04Nzc0LTA5ZDEzNDM1MWUwMCNsaXN0IiwiZW5jb2RlZExpc3QiOiJINHNJQUFBQUFBQUFfLTNCTVFFQUFBRENvUFZQYlF3Zm9BQUFBQUFBQUFBQUFBQUFBQUFBQUlDM0FZYlNWS3NBUUFBQSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi8zMzExNjU1Zi03NGRmLTRjZjMtODc3NC0wOWQxMzQzNTFlMDAiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2NTk2MTEzMn0.v9eANnCcqqyTt1fJ50O5cxTZhSJ4Bl2afusQBbKAnm8c7C9DCSuK5rQy3qoID_h4aJHxXs0UpNiz76RrbWxhyQ";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9e859997-d387-4654-8d5e-7d35da1c7c47
const gs1PrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNzZWN1cmUtcHJlZml4IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzI4MWVlMGNjLTcyMjUtNGJkNy1hNzcwLTA4Yjc2YWNkM2U1ZSNsaXN0IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi8yODFlZTBjYy03MjI1LTRiZDctYTc3MC0wOGI3NmFjZDNlNWUiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2Nzg3OTczMn0.eo9dKhZh5x_qsA8HzvsBizxAdLntvJNkDGSDDUA4pzRtfJ2CzZ5gVSp0Yx2dPyM41fGhQYew36ViXDH4uwUR-w";


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
        "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefix",
        "type": "JsonWebKey",
        "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
        "publicKeyJwk": {
          "key_ops": [
            "verify"
          ],
          "ext": true,
          "kty": "EC",
          "x": "hICdIQhLLPQUWhrjL3UZtKEhwHfk0qMqzB4GhXvdLMk",
          "y": "ncgaOb7OC9aNCBlolrZi2SWlVargVjoT1aLi6m_xUPM",
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
      "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefix"
    ],
    "authentication": [
      "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefix"
    ]
  }

const did_gs1_global: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
              "key_ops": [
                "verify"
              ],
              "ext": true,
              "kty": "EC",
              "x": "P2lWAfthH4udmM2h0-Mx6kPpr69o9n9CXLdFzXN0YhI",
              "y": "mLU90jewX5K-cxtuaxGcpXRqTEQrr1-4FqZ_AQ1fcqo",
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix"
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
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/3311655f-74df-4cf3-8774-09d134351e00") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/281ee0cc-7225-4bd7-a770-08b76acd3e5e") {
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
