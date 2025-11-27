import { jest } from '@jest/globals'

// Set environment variable for GS1 Global DID used in tests
process.env.GS1_GLOBAL_DID = "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/09510010000002
const validKeyCredentialAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkja2V5IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiS2V5Q3JlZGVudGlhbCJdLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJuYW1lIjoiVXRvcGlhIENvbXBhbnkifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvMDEvMDk1MTAwMTAwMDAwMDIiLCJleHRlbmRzQ3JlZGVudGlhbCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX3ByZWZpeC8wOTUxMDAxIn0sImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfa2V5LzAxLzA5NTEwMDEwMDAwMDAyIiwidmFsaWRGcm9tIjoiMjAyNS0xMS0yNlQxNDo1NjoyNVoiLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vYzA0NzBiNDktZDI2NC00YTg0LTljZjQtMjY3YjE2NzZlMDljIzYwMTQ5IiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3RFbnRyeSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwic3RhdHVzTGlzdEluZGV4IjoiNjAxNDkiLCJzdGF0dXNMaXN0Q3JlZGVudGlhbCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uL2MwNDcwYjQ5LWQyNjQtNGE4NC05Y2Y0LTI2N2IxNjc2ZTA5YyJ9LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9pZC5nczEub3JnL3ZjL3NjaGVtYS92MS9rZXkiLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9saWNlbnNlLWNvbnRleHQiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9kZWNsYXJhdGlvbi1jb250ZXh0IiwiaHR0cHM6Ly93M2lkLm9yZy92Yy9yZW5kZXItbWV0aG9kL3YxIl0sInJlbmRlck1ldGhvZCI6W3siY3NzM01lZGlhUXVlcnkiOiJAbWVkaWEgKG1pbi1hc3BlY3QtcmF0aW86IDMvMSkiLCJuYW1lIjoiV2ViIERpc3BsYXkiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUta2V5LXRlbXBsYXRlLnN2ZyIsInR5cGUiOiJTdmdSZW5kZXJpbmdUZW1wbGF0ZTIwMjMifV0sIm5hbWUiOiJHUzEgSUQgS2V5IENyZWRlbnRpYWwiLCJkZXNjcmlwdGlvbiI6IkRlY2xhcmVzIHRoZSBjcnlwdG9ncmFwaGljIGtleSBhc3NvY2lhdGVkIHdpdGggYSBHUzEgaWRlbnRpZmllciwgZW5hYmxpbmcgc2VjdXJlIGRpZ2l0YWwgc2lnbmF0dXJlcyBhbmQgdmVyaWZpY2F0aW9uIG9mIEdTMS1yZWxhdGVkIHRyYW5zYWN0aW9ucy4gVGhpcyBjcmVkZW50aWFsIGV4dGVuZHMgZnJvbSBhIENvbXBhbnkgUHJlZml4IExpY2Vuc2UgYW5kIGJpbmRzIGEgc3BlY2lmaWMgY3J5cHRvZ3JhcGhpYyBrZXkgdG8gYSBHUzEgaWRlbnRpZmllciwgZW5zdXJpbmcgdGhlIGF1dGhlbnRpY2l0eSBhbmQgaW50ZWdyaXR5IG9mIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHByb2R1Y3RzLCBsb2NhdGlvbnMsIG9yIGVudGl0aWVzIGlkZW50aWZpZWQgYnkgR1MxIHN0YW5kYXJkcy4iLCJpYXQiOjE3NjQxNjkwNDd9.85zq0KN2MHCgOZDkN-Qnm9Mk6UkHdpul0f5VIC8t1Oj006rPfdxKXlZ_-ky3mNH2298HmAD_I1Ph7STwCkeZOQ"
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001
const validCompanyPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55UHJlZml4ZXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxQ29tcGFueVByZWZpeExpY2Vuc2VDcmVkZW50aWFsIl0sImlzc3VlciI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwibmFtZSI6IkdTMSBVdG9waWEifSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkiLCJhbHRlcm5hdGl2ZUxpY2Vuc2VWYWx1ZSI6Ijk1MTAwMSIsImV4dGVuZHNDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxMDAxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDEwMDAwMDQiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IlV0b3BpYSBDb21wYW55In19LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX3ByZWZpeC8wOTUxMDAxIiwidmFsaWRGcm9tIjoiMjAyNS0xMS0yNVQwNzo0MTowOVoiLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNjhhYjRlMjUtZGUxZS00ZDA2LWI2YWQtYzBlYzVkNWM0MjViIzEyNTU2MyIsInR5cGUiOiJCaXRzdHJpbmdTdGF0dXNMaXN0RW50cnkiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsInN0YXR1c0xpc3RJbmRleCI6IjEyNTU2MyIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vNjhhYjRlMjUtZGUxZS00ZDA2LWI2YWQtYzBlYzVkNWM0MjViIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL2NvbXBhbnlwcmVmaXgiLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9saWNlbnNlLWNvbnRleHQiLCJodHRwczovL3czaWQub3JnL3ZjL3JlbmRlci1tZXRob2QvdjEiXSwibmFtZSI6IkdTMSBDb21wYW55IFByZWZpeCBMaWNlbnNlIiwicmVuZGVyTWV0aG9kIjpbeyJuYW1lIjoiV2ViIERpc3BsYXkiLCJjc3MzTWVkaWFRdWVyeSI6IkBtZWRpYSAobWluLWFzcGVjdC1yYXRpbzogMy8xKSIsInR5cGUiOiJTdmdSZW5kZXJpbmdUZW1wbGF0ZTIwMjMiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUtbGljZW5zZS10ZW1wbGF0ZS5zdmcifV0sImRlc2NyaXB0aW9uIjoiQXV0aG9yaXplcyBhIG1lbWJlciBjb21wYW55IHRvIHVzZSBhIHNwZWNpZmljIEdTMSBDb21wYW55IFByZWZpeCBmb3IgY3JlYXRpbmcgZ2xvYmFsbHkgdW5pcXVlIHByb2R1Y3QgaWRlbnRpZmllcnMuIElzc3VlZCBieSBhIE1lbWJlciBPcmdhbml6YXRpb24gdG8gY29tcGFuaWVzIHdpdGhpbiB0aGVpciByZWdpb24sIHRoaXMgY3JlZGVudGlhbCBleHRlbmRzIGZyb20gYSBHUzEgUHJlZml4IExpY2Vuc2UgYW5kIGVuYWJsZXMgdGhlIGNvbXBhbnkgdG8gZ2VuZXJhdGUgR1RJTnMsIEdMTnMsIGFuZCBvdGhlciBHUzEgaWRlbnRpZmljYXRpb24ga2V5cyBmb3IgdGhlaXIgcHJvZHVjdHMsIGxvY2F0aW9ucywgYW5kIGJ1c2luZXNzIGVudGl0aWVzLiBFc3NlbnRpYWwgZm9yIHN1cHBseSBjaGFpbiB0cmFjZWFiaWxpdHkgYW5kIGdsb2JhbCBjb21tZXJjZS4iLCJpYXQiOjE3NjQwNTY1NDF9.tQxli7tpOy6oUJUwYZWAKeW6OyniWRIyyfGPRPfuHwn6LEv_uMJ5sR5j7yZ0cZ8Lacq91RGJETjXE96JkYWsFQ";
// extends from...
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951
const validPrefixLicenseAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNrZXlzIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiR1MxUHJlZml4TGljZW5zZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDp3ZWI6Y29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGU6YXBpOnJlZ2lzdHJ5OmRpZDpnczFfdXRvcGlhIiwiYWx0ZXJuYXRpdmVMaWNlbnNlVmFsdWUiOiI5NTEiLCJsaWNlbnNlVmFsdWUiOiIwOTUxIiwib3JnYW5pemF0aW9uIjp7ImdzMTpwYXJ0eUdMTiI6IjA5NTEwMDAwMDAwMDUiLCJnczE6b3JnYW5pemF0aW9uTmFtZSI6IkdTMSBVdG9waWEifX0sImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvdmMvbGljZW5zZS9nczFfcHJlZml4LzA5NTEiLCJ2YWxpZEZyb20iOiIyMDI1LTExLTI1VDA3OjM3OjEzWiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi85ZTg1OTk5Ny1kMzg3LTQ2NTQtOGQ1ZS03ZDM1ZGExYzdjNDcjNTI4NTIiLCJ0eXBlIjoiQml0c3RyaW5nU3RhdHVzTGlzdEVudHJ5Iiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJzdGF0dXNMaXN0SW5kZXgiOiI1Mjg1MiIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vOWU4NTk5OTctZDM4Ny00NjU0LThkNWUtN2QzNWRhMWM3YzQ3In0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2lkLmdzMS5vcmcvdmMvc2NoZW1hL3YxL3ByZWZpeCIsInR5cGUiOiJKc29uU2NoZW1hIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy9ucy9jcmVkZW50aWFscy92MiIsImh0dHBzOi8vcmVmLmdzMS5vcmcvZ3MxL3ZjL2xpY2Vuc2UtY29udGV4dCIsImh0dHBzOi8vdzNpZC5vcmcvdmMvcmVuZGVyLW1ldGhvZC92MSJdLCJuYW1lIjoiR1MxIFByZWZpeCBMaWNlbnNlIiwicmVuZGVyTWV0aG9kIjpbeyJuYW1lIjoiV2ViIERpc3BsYXkiLCJjc3MzTWVkaWFRdWVyeSI6IkBtZWRpYSAobWluLWFzcGVjdC1yYXRpbzogMy8xKSIsInR5cGUiOiJTdmdSZW5kZXJpbmdUZW1wbGF0ZTIwMjMiLCJpZCI6Imh0dHBzOi8vZ3MxLmdpdGh1Yi5pby9HUzFEaWdpdGFsTGljZW5zZXMvdGVtcGxhdGVzL2dzMS1zYW1wbGUtbGljZW5zZS10ZW1wbGF0ZS5zdmcifV0sImRlc2NyaXB0aW9uIjoiVmVyaWZpZXMgdGhlIGF1dGhvcml6ZWQgYXNzaWdubWVudCBvZiBhIEdTMSBwcmVmaXggdG8gYSBNZW1iZXIgT3JnYW5pemF0aW9uIGJ5IEdTMSBHbG9iYWwuIFRoaXMgY3JlZGVudGlhbCBlc3RhYmxpc2hlcyB0aGUgZm91bmRhdGlvbmFsIGF1dGhvcml0eSB0aGF0IGVuYWJsZXMgdGhlIE1lbWJlciBPcmdhbml6YXRpb24gdG8gaXNzdWUgQ29tcGFueSBQcmVmaXggTGljZW5zZXMgdG8gbWVtYmVyIGNvbXBhbmllcyB3aXRoaW4gdGhlaXIgZ2VvZ3JhcGhpYyByZWdpb24gb3IgbWFya2V0IHNlY3Rvci4gVGhlIHByZWZpeCBmb3JtcyB0aGUgYmFzaXMgZm9yIGNyZWF0aW5nIGdsb2JhbGx5IHVuaXF1ZSBpZGVudGlmaWVycyBpbiB0aGUgR1MxIHN5c3RlbS4iLCJpYXQiOjE3NjQwNTYyOTR9.ldEZFwIbx3TPeEUbNZQ7RESc2sXzOh9hztWu9YawhjGtU6WOuXXsTn9HDNv_NlJs4Kb_E1wJr2m-1RW1fDk-RQ";

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/c0470b49-d264-4a84-9cf4-267b1676e09c
const keyCredentialStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6dXRvcGlhX2NvbXBhbnkja2V5IiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOnV0b3BpYV9jb21wYW55IiwibmFtZSI6IlV0b3BpYSBDb21wYW55In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiaHR0cHM6Ly9jb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZS9hcGkvcmVnaXN0cnkvc3RhdHVzL3Jldm9jYXRpb24vYzA0NzBiNDktZDI2NC00YTg0LTljZjQtMjY3YjE2NzZlMDljI2xpc3QiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBXy0zT1FRa0FBQWdFc01QLW9hMXdQMEcyQkVzQUFBQUFBQUFBQUtBeDF3RUFBQUFBQUFDQTF4WnVBSDc0QUVBQUFBIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi9jMDQ3MGI0OS1kMjY0LTRhODQtOWNmNC0yNjdiMTY3NmUwOWMiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIiwiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eS9zdWl0ZXMvandzLTIwMjAvdjEiXSwiaWF0IjoxNzY0MTUyNjgyfQ.tdGDQ5dUN1vHXj4GODb0f1vyQZM4dKjg8w-6jpWia9iXPI0PBQJaJ7ZcqMYaEgncgMGN8qnuHhDJsnoSEH_CWw";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/68ab4e25-de1e-4d06-b6ad-c0ec5d5c425b
const companyPrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX3V0b3BpYSNjb21wYW55UHJlZml4ZXMiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV91dG9waWEiLCJuYW1lIjoiR1MxIFV0b3BpYSJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzY4YWI0ZTI1LWRlMWUtNGQwNi1iNmFkLWMwZWM1ZDVjNDI1YiNsaXN0IiwiZW5jb2RlZExpc3QiOiJINHNJQUFBQUFBQUFfLTNCTVFFQUFBRENvUFZQYlF3Zm9BQUFBQUFBQUFBQUFBQUFBQUFBQUlDM0FZYlNWS3NBUUFBQSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi82OGFiNGUyNS1kZTFlLTRkMDYtYjZhZC1jMGVjNWQ1YzQyNWIiLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2NDA1NjU0MH0.xVaH8XOdQM9rRchx7vf2FV9dSEv8bXlGlIlCvrzgoEenDAkjhYYhI68I1xlrA_Xr6xHuPHnn17q7UlOnqEgiKg";
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9e859997-d387-4654-8d5e-7d35da1c7c47
const gs1PrefixLicenseStatusListAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6Z3MxX2dsb2JhbCNrZXlzIiwiYWxnIjoiRVMyNTYifQ.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQml0c3RyaW5nU3RhdHVzTGlzdENyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmdzMV9nbG9iYWwiLCJuYW1lIjoiR1MxIEdsb2JhbCJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzllODU5OTk3LWQzODctNDY1NC04ZDVlLTdkMzVkYTFjN2M0NyNsaXN0IiwiZW5jb2RlZExpc3QiOiJINHNJQUFBQUFBQUFfLTNCTVFFQUFBRENvUFZQYlF3Zm9BQUFBQUFBQUFBQUFBQUFBQUFBQUlDM0FZYlNWS3NBUUFBQSIsInN0YXR1c1B1cnBvc2UiOiJyZXZvY2F0aW9uIiwidHlwZSI6IkJpdHN0cmluZ1N0YXR1c0xpc3QifSwiaWQiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi85ZTg1OTk5Ny1kMzg3LTQ2NTQtOGQ1ZS03ZDM1ZGExYzdjNDciLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvc3RhdHVzL3YxIl0sImlhdCI6MTc2NDA1NjI5Mn0.5DPycSGnQiPul5otTtau_H23GxdD8fYwFMddrNLF6KPgcYt1broWL5AfcAAE3c9HpUd8RuH2TQqqSaJKojvuvQ";


const did_gs1_company: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#key",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "k8d4Ct6qg6kM8hDSu1XXADpYQL4gTeBA4cOFoqPgSnA",
                "y": "-OpyF7hfqYsLM8AgdoCNIDJ0uxSE9MDiZ6KVyB9dqd4",
                "kid": "key"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:utopia_company#key"
    ]
}

const did_gs1_utopia: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefixes",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "KoceDkyWMfpMnEy9bIPF436gC3Wg2cHckCtGROW4D5I",
                "y": "MVREuqMTfVnRHEt3UVRC9-Jk7uD9W3kCC4oYys_tH2M",
                "kid": "companyPrefixes"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefixes"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_utopia#companyPrefixes"
    ]
}

const did_gs1_global: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#keys",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "L7U2iyliJI0c_bS3lIC8Wj1yxTM5g4AwfCLi_gTwVbg",
                "y": "CKmwD7ST1yrU4fwb1MEOGMBKRyxEyx-txo-i_LI8IBU",
                "kid": "keys"
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
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#keys"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#keys"
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
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/09510010000002") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: validKeyCredentialAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/0951001") {
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
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/c0470b49-d264-4a84-9cf4-267b1676e09c") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: keyCredentialStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/68ab4e25-de1e-4d06-b6ad-c0ec5d5c425b") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseStatusListAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/9e859997-d387-4654-8d5e-7d35da1c7c47") {
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
