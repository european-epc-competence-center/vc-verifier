import { jest } from '@jest/globals'

// TODO: Test valid GS1 Credentials, Problem: GS1 vc-verifier-rules package throws error GS1-140

// Starting with revoked GS1 Credential:

// Key Credential: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/e9479679-cfab-4659-a0c4-fc4c6029acc8
const revokedGS1KeyCredentialAsJWT = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkja2V5cyIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiS2V5Q3JlZGVudGlhbCJdLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJuYW1lIjoiVXRvcGlhIENvbXBhbnkifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvMDEvMDk1MTAwMTAwMDAwMiIsImV4dGVuZHNDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEwMDEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS92Yy9lOTQ3OTY3OS1jZmFiLTQ2NTktYTBjNC1mYzRjNjAyOWFjYzgiLCJ2YWxpZEZyb20iOiIyMDI1LTA5LTI1VDA5OjE5OjM3WiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi80ZmYxYjAyMS02ZDRjLTQ4NTItYmIwNC1lZjMxODQ4Zjc1NTIjMTA0NjA1IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3RFbnRyeSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwic3RhdHVzTGlzdEluZGV4IjoiMTA0NjA1Iiwic3RhdHVzTGlzdENyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi80ZmYxYjAyMS02ZDRjLTQ4NTItYmIwNC1lZjMxODQ4Zjc1NTIifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vaWQuZ3MxLm9yZy92Yy9zY2hlbWEvdjEva2V5Lmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9kZWNsYXJhdGlvbi1jb250ZXh0Il0sImRlc2NyaXB0aW9uIjoiRGVjbGFyZXMgdGhlIGNyeXB0b2dyYXBoaWMga2V5IGFzc29jaWF0ZWQgd2l0aCBhIEdTMSBpZGVudGlmaWVyLCBlbmFibGluZyBzZWN1cmUgZGlnaXRhbCBzaWduYXR1cmVzIGFuZCB2ZXJpZmljYXRpb24gb2YgR1MxLXJlbGF0ZWQgdHJhbnNhY3Rpb25zLiBUaGlzIGNyZWRlbnRpYWwgZXh0ZW5kcyBmcm9tIGEgQ29tcGFueSBQcmVmaXggTGljZW5zZSBhbmQgYmluZHMgYSBzcGVjaWZpYyBjcnlwdG9ncmFwaGljIGtleSB0byBhIEdTMSBpZGVudGlmaWVyLCBlbnN1cmluZyB0aGUgYXV0aGVudGljaXR5IGFuZCBpbnRlZ3JpdHkgb2YgZGF0YSBhc3NvY2lhdGVkIHdpdGggcHJvZHVjdHMsIGxvY2F0aW9ucywgb3IgZW50aXRpZXMgaWRlbnRpZmllZCBieSBHUzEgc3RhbmRhcmRzLiIsInJlbmRlck1ldGhvZCI6W3siaWQiOiJodHRwczovL2dzMS5naXRodWIuaW8vR1MxRGlnaXRhbExpY2Vuc2VzL3RlbXBsYXRlcy9nczEtc2FtcGxlLWxpY2Vuc2UtdGVtcGxhdGUuc3ZnIiwidHlwZSI6IlN2Z1JlbmRlcmluZ1RlbXBsYXRlIiwiY3NzM01lZGlhUXVlcnkiOiJAbWVkaWEgKG1pbi1hc3BlY3QtcmF0aW86IDMvMSkiLCJuYW1lIjoiV2ViIERpc3BsYXkifV0sIm5hbWUiOiJHUzEgSUQgS2V5IENyZWRlbnRpYWwiLCJpYXQiOjE3NTg3OTIwMTl9.-sXqpX0XcP122J81_MhPQ6KXwUu-UBwpLrRtMk6rktjem9M3FPM-l-eCO2GQnzG_KBQlALdONxo_-Szm0s6t6w";
// Company Prefix license: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001
const revokedInChain1 = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55LXByZWZpeGVzIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxQ29tcGFueVByZWZpeExpY2Vuc2VDcmVkZW50aWFsIl0sImlzc3VlciI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwibmFtZSI6IkdTMSBVdG9waWEifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJhbHRlcm5hdGl2ZUxpY2Vuc2VWYWx1ZSI6Ijk1MTAwMSIsImV4dGVuZHNDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxMDAxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDEwMDAwMDEiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IlV0b3BpYSBDb21wYW55In19LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX3ByZWZpeC8wOTUxMDAxIiwidmFsaWRGcm9tIjoiMjAyNS0xMC0wMVQxMjowMDo1MloiLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNDJjMzU1NWEtYzhiYi00MDYwLTg0MzUtZWU4NWVlNGVjYzhiIzEyMjU3MSIsInR5cGUiOiJCaXRzdHJpbmdTdGF0dXNMaXN0RW50cnkiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsInN0YXR1c0xpc3RJbmRleCI6IjEyMjU3MSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNDJjMzU1NWEtYzhiYi00MDYwLTg0MzUtZWU4NWVlNGVjYzhiIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL2NvbXBhbnlwcmVmaXgiLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9saWNlbnNlLWNvbnRleHQiXSwicmVuZGVyTWV0aG9kIjpbeyJjc3MzTWVkaWFRdWVyeSI6IkBtZWRpYSAobWluLWFzcGVjdC1yYXRpbzogMy8xKSIsInR5cGUiOiJTdmdSZW5kZXJpbmdUZW1wbGF0ZSIsImlkIjoiaHR0cHM6Ly9nczEuZ2l0aHViLmlvL0dTMURpZ2l0YWxMaWNlbnNlcy90ZW1wbGF0ZXMvZ3MxLXNhbXBsZS1saWNlbnNlLXRlbXBsYXRlLnN2ZyIsIm5hbWUiOiJXZWIgRGlzcGxheSJ9XSwiZGVzY3JpcHRpb24iOiJBdXRob3JpemVzIGEgbWVtYmVyIGNvbXBhbnkgdG8gdXNlIGEgc3BlY2lmaWMgR1MxIENvbXBhbnkgUHJlZml4IGZvciBjcmVhdGluZyBnbG9iYWxseSB1bmlxdWUgcHJvZHVjdCBpZGVudGlmaWVycy4gSXNzdWVkIGJ5IGEgTWVtYmVyIE9yZ2FuaXphdGlvbiB0byBjb21wYW5pZXMgd2l0aGluIHRoZWlyIHJlZ2lvbiwgdGhpcyBjcmVkZW50aWFsIGV4dGVuZHMgZnJvbSBhIEdTMSBQcmVmaXggTGljZW5zZSBhbmQgZW5hYmxlcyB0aGUgY29tcGFueSB0byBnZW5lcmF0ZSBHVElOcywgR0xOcywgYW5kIG90aGVyIEdTMSBpZGVudGlmaWNhdGlvbiBrZXlzIGZvciB0aGVpciBwcm9kdWN0cywgbG9jYXRpb25zLCBhbmQgYnVzaW5lc3MgZW50aXRpZXMuIEVzc2VudGlhbCBmb3Igc3VwcGx5IGNoYWluIHRyYWNlYWJpbGl0eSBhbmQgZ2xvYmFsIGNvbW1lcmNlLiIsIm5hbWUiOiJHUzEgQ29tcGFueSBQcmVmaXggTGljZW5zZSIsImlhdCI6MTc1OTMyMDE2MH0.eVZ9N8yP06KjrSQOl9LXxuvXbMtcBPu-2U0TDrDOTAyMtEOKBMyC4IXioL894Wl9zrL2-BmbDId1qAcES2xLjQ";
// GS1 Prefix License: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951
const revokedInChain2 = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNwcmVmaXhlcyIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxUHJlZml4TGljZW5zZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwiYWx0ZXJuYXRpdmVMaWNlbnNlVmFsdWUiOiI5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDAwMDAwMDEiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IkdTMSBVdG9waWEifX0sImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJ2YWxpZEZyb20iOiIyMDI1LTEwLTAxVDEyOjA2OjE2WiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9iMzBkYTVmMy0zYmVmLTQwZGEtYTE4Mi03MWZjODcyZDQyYmQjNTUwMDgiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiI1NTAwOCIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vYjMwZGE1ZjMtM2JlZi00MGRhLWExODItNzFmYzg3MmQ0MmJkIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL3ByZWZpeCIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCJdLCJyZW5kZXJNZXRob2QiOlt7ImNzczNNZWRpYVF1ZXJ5IjoiQG1lZGlhIChtaW4tYXNwZWN0LXJhdGlvOiAzLzEpIiwidHlwZSI6IlN2Z1JlbmRlcmluZ1RlbXBsYXRlIiwiaWQiOiJodHRwczovL2dzMS5naXRodWIuaW8vR1MxRGlnaXRhbExpY2Vuc2VzL3RlbXBsYXRlcy9nczEtc2FtcGxlLWxpY2Vuc2UtdGVtcGxhdGUuc3ZnIiwibmFtZSI6IldlYiBEaXNwbGF5In1dLCJkZXNjcmlwdGlvbiI6IlZlcmlmaWVzIHRoZSBhdXRob3JpemVkIGFzc2lnbm1lbnQgb2YgYSBHUzEgcHJlZml4IHRvIGEgTWVtYmVyIE9yZ2FuaXphdGlvbiBieSBHUzEgR2xvYmFsLiBUaGlzIGNyZWRlbnRpYWwgZXN0YWJsaXNoZXMgdGhlIGZvdW5kYXRpb25hbCBhdXRob3JpdHkgdGhhdCBlbmFibGVzIHRoZSBNZW1iZXIgT3JnYW5pemF0aW9uIHRvIGlzc3VlIENvbXBhbnkgUHJlZml4IExpY2Vuc2VzIHRvIG1lbWJlciBjb21wYW5pZXMgd2l0aGluIHRoZWlyIGdlb2dyYXBoaWMgcmVnaW9uIG9yIG1hcmtldCBzZWN0b3IuIFRoZSBwcmVmaXggZm9ybXMgdGhlIGJhc2lzIGZvciBjcmVhdGluZyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnMgaW4gdGhlIEdTMSBzeXN0ZW0uIiwibmFtZSI6IkdTMSBQcmVmaXggTGljZW5zZSIsImlhdCI6MTc1OTMyMDQ0NH0.39OEcW6IxO_SBsd9m-LDKGm_tA_6ilWVxYzsdfizW0i52cRzv27wZzBJ3CioX7xmv4q8ejJ-pJwPdbhv4PvkXg";

// Status List Credential of Key Credential: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/4ff1b021-6d4c-4852-bb04-ef31848f7552
const statusListCredentialOfRevoked = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkja2V5cyIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOnV0b3BpYV9jb21wYW55IiwibmFtZSI6IlV0b3BpYSBDb21wYW55In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNGZmMWIwMjEtNmQ0Yy00ODUyLWJiMDQtZWYzMTg0OGY3NTUyI2xpc3QiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdCIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwiZW5jb2RlZExpc3QiOiJINHNJQUFBQUFBQUFfLTNPUVFrQUFBZ0VzSHZZUDdNcERoRzJCRXNBQUFBQUFBQUFBQUFBQUFEZ2xia09BQUFBTkN6TUhOMlZBRUFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi80ZmYxYjAyMS02ZDRjLTQ4NTItYmIwNC1lZjMxODQ4Zjc1NTIiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc1ODc5MjQ0OX0.UbdKFYsjGobbGCgVG9GkloDZTX6tBJ9yfddL4c6HpvBwqGbAJqwxJ_2tyCzGfkTZRM8OfmE8HGBIRGI0QwGhcA";
// Status List Credential of revokedInChain1: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/42c3555a-c8bb-4060-8435-ee85ee4ecc8b
const statusListCredentialOfInChain1 = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55LXByZWZpeGVzIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV91dG9waWEiLCJuYW1lIjoiR1MxIFV0b3BpYSJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzQyYzM1NTVhLWM4YmItNDA2MC04NDM1LWVlODVlZTRlY2M4YiNsaXN0IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi80MmMzNTU1YS1jOGJiLTQwNjAtODQzNS1lZTg1ZWU0ZWNjOGIiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc1ODc5MTg0M30.0Rqf-ty7Eu21uQfPnSTj0zMyKRyBl1wAGTaVW97XMCGsQDJipYHlCGo7IvFcRRRmP5N4qi8LnTRAxF2ypk097w";
// Status List Credential of revokedInChain2: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b30da5f3-3bef-40da-a182-71fc872d42bd
const statusListCredentialOfInChain2 = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNwcmVmaXhlcyIsImFsZyI6IkVTMjU2In0.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uL2IzMGRhNWYzLTNiZWYtNDBkYS1hMTgyLTcxZmM4NzJkNDJiZCNsaXN0IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zQk1RRUFBQURDb1BWUGJRd2ZvQUFBQUFBQUFBQUFBQUFBQUFBQUFJQzNBWWJTVktzQVFBQUEifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9iMzBkYTVmMy0zYmVmLTQwZGEtYTE4Mi03MWZjODcyZDQyYmQiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc1ODc5MTE3Nn0.VHsipO-xD4LE4Pfv82nioAaLGa4WH0cdpeF9wskBms_B1HwJ5iuwmxDa0543Enwmux2BO3OQdS4-mlulPJsiZw";

const did_gs1_company: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#keys",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
            "publicKeyJwk": {
                "kid": "keys",
                "kty": "EC",
                "crv": "P-256",
                "x": "fDwn5wfKQzKhxVkCtu_nb-Ku8qnpb6Z3XX-0srlcyoA",
                "y": "5SDv2HeyVbRsATzaxK4FjVC7gCGqkfeMtq1QyjuLKsA"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#keys"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#keys"
    ]
}

const did_gs1_utopia: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#company-prefixes",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
            "publicKeyJwk": {
                "kid": "company-prefixes",
                "kty": "EC",
                "crv": "P-256",
                "x": "CQPHcZPbg_bAy44sfoK6C6obsqQ7KWv8quHw1WAfgHw",
                "y": "FnQVbogvGghFUDZhtlptSYe_u--Smnjw4ltnXgiE6jM"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#company-prefixes"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#company-prefixes"
    ]
}

const did_gs1_global: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#test",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
                "kid": "test",
                "kty": "EC",
                "crv": "P-256",
                "x": "1VT6nW6UUZj4PUiPVIMqKKmCLexeoB49Qb7d1A66kvU",
                "y": "3DY-nOEJUdyGbSEQd9_a5zFYQdqDY4NMvNS_v5cAtn4"
            }
        },
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#testRSA",
            "type": "JsonWebKey2020",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
                "kty": "RSA",
                "n": "3mXHZEWktJHxw1s_jyKmFWJPBk-10Hb1OPMHQ_fCTC2D4yNpflladamr3tmAI5qCmr7ZYGzX7WCAj_-FN_btouJcWlf3hlysp3m1g0at_oke057Ji_tuW_vl9Zc5amYg0BGpwh1lsIKWF7gO785lFjkpiiVna4XL1T3XiAk-ygmqeQTwqN-pBC3ELRrgQofMzzWGbYv6Wjitl67n0aC4nKifNr2mPWmunMrQsykBjDwbQQUBYoLlbb49GE_4TCnLyN_mwR5gi3Q-rHIUYiiUcPNDr8OSTHa2R4ARZ9an-SWXb-dZIzz3IV7yZW5G2aFZNPwcULvv0TIDVsjshXDTLpNMVCQbhdaEEhZKnqwX83cQa8y2O_bizKXEW1OcWmmKxvYqRpCRTBNUBAmMq2DsS5oFMs0E5oAJZgSGrNiamtKx9Nz3NDQV_qyi3p-gqSShIUTlqTYxIkp5dM0-qIj7buxP1xDOy24Sblc7o1fr-C91jn88OJd5d7XeOcbIOOGs3syLl39eyUI-35Zub7y-PdKedZMJKrFDpWW4Q9JZniXdkawpS9515VSJxFF_l_UK0OC0nspHmW6-xorwKV_67OSGkpmd_bIiJ_DmOE0Vl80CITD2NT3-BNWt9NH6cBwei3SO7Corw6Rs0yDupxThn3MWZt387Ik6jiJHiIj7E60",
                "e": "AQAB",
                "kid": "testRSA"
            }
        },
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixes",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
                "kid": "prefixes",
                "kty": "EC",
                "crv": "P-256",
                "x": "_pN0Q04zIxSXIj-sIqFGvLH3N-kpxJY83D_IxDabY5E",
                "y": "jbYK7xV0dICDlzNlAMLLzeZ34fkr2nJj3MaoFLazRBs"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#test",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#testRSA",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#prefixes"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#test",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#testRSA"
    ]
}


// Helper function to resolve DID fragments
function resolveDIDFragment(didDocument: any, fragmentId: string) {
    // Find the verification method with the matching fragment ID
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) => 
        vm.id.endsWith(`#${fragmentId}`)
    );
    
    if (verificationMethod) {
        return verificationMethod;
    }
    
    // If not found in verificationMethod, return the whole document
    return didDocument;
}

// Mock the document loader
await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        // Handle credential URLs
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001") {
            console.log("using mocks for 0951001...");
            return {
                contextUrl: null,
                documentUrl: url,
                document: revokedInChain1
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951") {
            console.log("using mocks for 0951...");
            return {
                contextUrl: null,
                documentUrl: url,
                document: revokedInChain2
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/4ff1b021-6d4c-4852-bb04-ef31848f7552") {
            console.log("using mocks for status list of key credential...");
            return { 
                contextUrl: null,
                documentUrl: url,
                document: statusListCredentialOfRevoked
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/42c3555a-c8bb-4060-8435-ee85ee4ecc8b") {
            console.log("using mocks for status list of company prefix license credential...");
            return {
                contextUrl: null,
                documentUrl: url,
                document: statusListCredentialOfInChain1
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b30da5f3-3bef-40da-a182-71fc872d42bd") {
            console.log("using mocks for status list of GS1 prefix license credential...");
            return {
                contextUrl: null,
                documentUrl: url,
                document: statusListCredentialOfInChain2
            };
        }
        
        // Handle DIDs with fragments
        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');
            
            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company") {
                console.log(`using DID mock for utopia_company${fragment ? '#' + fragment : ''}...`);
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
                console.log(`using DID mock for gs1_utopia${fragment ? '#' + fragment : ''}...`);
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
                console.log(`using DID mock for gs1_global${fragment ? '#' + fragment : ''}...`);
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

    // Revoked GS1 Credential as JWT
    test("Verify revoked GS1 Key Credential as JWT with GS1 endpoint", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([revokedGS1KeyCredentialAsJWT]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.verified).toBe(false);
        expect(res.body.statusResult.verified).toBe(false);
    });
});
