import { jest } from '@jest/globals'

// Set environment variable for GS1 Global DID used in tests
process.env.GS1_GLOBAL_DID = "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global";

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/2b5cedca-f18b-47ae-b9dc-fe36b82dd96d
// Regression: base64url JWT ProductDataCredential that previously failed with vc-verifier-rules
const productDataCredentialAsJwt = "eyJraWQiOiJkaWQ6d2ViOmNvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlOmFwaTpyZWdpc3RyeTpkaWQ6ZWVjYyNicHBfdmNfaXNzdWFuY2UiLCJhbGciOiJFUzI1NiJ9.eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRGF0YUNyZWRlbnRpYWwiLCJQcm9kdWN0RGF0YUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOndlYjpjb21wYW55LXdhbGxldC1kZXYucHJvZC1rOHMuZWVjYy5kZTphcGk6cmVnaXN0cnk6ZGlkOmVlY2MiLCJuYW1lIjoiRUVDQyJ9LCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vcHAuZHBwLXdsLnByb2QtazhzLmVlY2MuZGUvMDEvMDQwNDcxMTEwMDAwMDYiLCJwcm9kdWN0Ijp7ImdzMTpicmFuZCI6eyJnczE6YnJhbmROYW1lIjoiRUVDQyBCYXR0ZXJ5IFBhc3Nwb3J0In0sImdzMTpwcm9kdWN0RGVzY3JpcHRpb24iOiJMTVQgYmF0dGVyeSDigJMgTW9kZWw6IGh0dHA6Ly9pZC5lZWNjLmRlLzAxLzA0MDQ3MTExMDAwMDA2In0sImRhdGEiOlt7InRpdGxlIjoiwqc2LjEgSWRlbnRpZmllcnMgYW5kIFByb2R1Y3QgRGF0YSIsImRlc2NyaXB0aW9uIjoiQmF0dGVyeSBtb2RlbCBpZGVudGlmaWNhdGlvbiwgbWFudWZhY3R1cmVyIGluZm9ybWF0aW9uLCBhbmQgcHJvZHVjdCBkYXRhIiwiYXR0cmlidXRlcyI6W3sidGl0bGUiOiJCYXR0ZXJ5IE1vZGVsIElkZW50aWZpZXIiLCJ2YWx1ZSI6Imh0dHA6Ly9pZC5lZWNjLmRlLzAxLzA0MDQ3MTExMDAwMDA2IiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkJhdHRlcnkgQ2F0ZWdvcnkiLCJ2YWx1ZSI6ImxtdCIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJCYXR0ZXJ5IE1hc3MiLCJ2YWx1ZSI6IjEga2ciLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiV2FycmFudHkgUGVyaW9kIiwidmFsdWUiOiIwMDAxLTA2IiwidmFsdWVEZXNjcmlwdGlvbiI6IllZWVktTU0gZm9ybWF0IiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1hbnVmYWN0dXJlciBJRCIsInZhbHVlIjoiaHR0cDovL2lkLmVlY2MuZGUvNDE3LzA0MDQ3MTExMDAwMDA2IiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1hbnVmYWN0dXJlciBOYW1lIiwidmFsdWUiOiJFRUNDIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1hbnVmYWN0dXJlciBUcmFkZSBOYW1lIiwidmFsdWUiOiJFRUNDIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1hbnVmYWN0dXJlciBBZGRyZXNzIiwidmFsdWUiOiJCdXNzYXJkd2VnIDE4LCA0MTQ2OCBOZXVzcywgTlJXLCBERSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJNYW51ZmFjdHVyZXIgV2ViIEFkZHJlc3MiLCJ2YWx1ZSI6Imh0dHA6Ly9lZWNjLmRlIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1hbnVmYWN0dXJlciBFbWFpbCIsInZhbHVlIjoic2ViYXN0aWFuLnNjaG1pdHRuZXJAZWVjYy5kZSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJNYW51ZmFjdHVyaW5nIFBsYWNlIiwidmFsdWUiOiJCdXNzYXJkd2VnIDE4LCA0MTQ2OCBOZXVzcywgTlJXLCBERSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJNYW51ZmFjdHVyaW5nIFBsYWNlIElEIiwidmFsdWUiOiJodHRwOi8vaWQuZWVjYy5kZS80MTQvMDQwNDcxMTEwMDAwMDYiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiT3BlcmF0b3IgTmFtZSIsInZhbHVlIjoiRXVyb3BlbiBFUEMgQ29tcGV0ZW5jZSBDZW50ZXIiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiT3BlcmF0b3IgQWRkcmVzcyIsInZhbHVlIjoiQnVzc2FyZHdlZyAxOCwgNDE0NjggTmV1c3MsIE5SVywgREUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiT3BlcmF0b3IgV2ViIEFkZHJlc3MiLCJ2YWx1ZSI6Imh0dHBzOi8vZWVjYy5kZSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19XX0seyJ0aXRsZSI6IsKnNi4yIFN5bWJvbHMsIExhYmVscyBhbmQgQ29uZm9ybWl0eSIsImRlc2NyaXB0aW9uIjoiUmVndWxhdG9yeSBzeW1ib2xzLCBsYWJlbHMsIGFuZCBjb25mb3JtaXR5IGRvY3VtZW50YXRpb24iLCJhdHRyaWJ1dGVzIjpbeyJ0aXRsZSI6IlNlcGFyYXRlIENvbGxlY3Rpb24gU3ltYm9sIiwidmFsdWUiOiIhW0Nyb3NzZWQtb3V0IHdoZWVsZWQgYmluIChXRUVFLCBJRUMgNjA0MTctNjQxNCldKGh0dHBzOi8vYnBwLnByb2QtazhzLmVlY2MuZGUvaW1hZ2VzL3dlZWUtc3ltYm9sLnN2ZykiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiQ2FkbWl1bSAvIExlYWQgQ29udGVudCIsInZhbHVlIjoibm9uZSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJFeHRpbmd1aXNoaW5nIEFnZW50cyIsInZhbHVlIjoid2F0ZXIsIHdhdGVyLW1pc3QsIGNsYXNzLWQtcG93ZGVyIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1lYW5pbmcgb2YgTGFiZWxzIGFuZCBTeW1ib2xzIiwidmFsdWUiOiJodHRwczovL2VlY2MuZGUvZG9jcy9Nb0xhUy5wZGYiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiRVUgRGVjbGFyYXRpb24gb2YgQ29uZm9ybWl0eSIsInZhbHVlIjoiIVtDRSBtYXJrIChDb25mb3JtaXTDqSBFdXJvcMOpZW5uZSldKGh0dHBzOi8vYnBwLnByb2QtazhzLmVlY2MuZGUvaW1hZ2VzL2NlLW1hcmsuc3ZnKVxuXG5odHRwczovL2VlY2MuZGUvZG9jcy9FVS1Eb0MucGRmIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkVVIERlY2xhcmF0aW9uIG9mIENvbmZvcm1pdHkgSUQiLCJ2YWx1ZSI6IkVVLURvQy1FRUNDLTAwMSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJUZXN0IFJlcG9ydHMgLyBSZXN1bHRzIiwidmFsdWUiOiJSZXN0cmljdGVkIGFjY2VzcyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfV19LHsidGl0bGUiOiLCpzYuMyBDYXJib24gRm9vdHByaW50IiwiZGVzY3JpcHRpb24iOiJDYXJib24gZm9vdHByaW50IHBlciBmdW5jdGlvbmFsIHVuaXQgYW5kIGxpZmVjeWNsZSBzdGFnZSBjb250cmlidXRpb25zIiwiYXR0cmlidXRlcyI6W3sidGl0bGUiOiJDYXJib24gRm9vdHByaW50IHBlciBGdW5jdGlvbmFsIFVuaXQiLCJ2YWx1ZSI6IjIzNCBrZ0NPMmUva1doIiwidmFsdWVEZXNjcmlwdGlvbiI6IlRvdGFsIGxpZmVjeWNsZSBjYXJib24gZm9vdHByaW50IiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkNhcmJvbiBGb290cHJpbnQgUGVyZm9ybWFuY2UgQ2xhc3MiLCJ2YWx1ZSI6IkEiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiQ2FyYm9uIEZvb3RwcmludCBTdHVkeSIsInZhbHVlIjoiaHR0cHM6Ly9lZWNjLmRlL3N1c3RhaW5hYmlsaXR5L2NhcmJvbi1mb290cHJpbnQtc3R1ZHkucGRmIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkxpZmVjeWNsZTogUmF3IE1hdGVyaWFsIEFjcXVpc2l0aW9uICYgUHJlcHJvY2Vzc2luZyIsInZhbHVlIjoiNTIgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJMaWZlY3ljbGU6IE1haW4gUHJvZHVjdCBQcm9kdWN0aW9uICYgTWFudWZhY3R1cmluZyIsInZhbHVlIjoiMjIgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJMaWZlY3ljbGU6IERpc3RyaWJ1dGlvbiIsInZhbHVlIjoiNCAlIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkxpZmVjeWNsZTogRW5kIG9mIExpZmUgJiBSZWN5Y2xpbmciLCJ2YWx1ZSI6IjcgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJBYnNvbHV0ZSBCYXR0ZXJ5IENhcmJvbiBGb290cHJpbnQiLCJ2YWx1ZSI6IjQgdENPMmUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfV19LHsidGl0bGUiOiLCpzYuNCBTdXBwbHkgQ2hhaW4gRHVlIERpbGlnZW5jZSIsImRlc2NyaXB0aW9uIjoiU3VwcGx5IGNoYWluIGR1ZSBkaWxpZ2VuY2UgcmVwb3J0IGFuZCB0aGlyZC1wYXJ0eSBhc3N1cmFuY2VzIiwiYXR0cmlidXRlcyI6W3sidGl0bGUiOiJEdWUgRGlsaWdlbmNlIFJlcG9ydCIsInZhbHVlIjoiaHR0cHM6Ly9lZWNjLmRlL3N1c3RhaW5hYmlsaXR5L2R1ZS1kaWxpZ2VuY2UtcmVwb3J0LnBkZiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19XX0seyJ0aXRsZSI6IsKnNi41IE1hdGVyaWFscyBhbmQgQ29tcG9zaXRpb24iLCJkZXNjcmlwdGlvbiI6IkJhdHRlcnkgY2hlbWlzdHJ5LCBjcml0aWNhbCByYXcgbWF0ZXJpYWxzLCBhbmQgaGF6YXJkb3VzIHN1YnN0YW5jZXMiLCJhdHRyaWJ1dGVzIjpbeyJ0aXRsZSI6IkJhdHRlcnkgQ2hlbWlzdHJ5IOKAlCBDYXRob2RlIiwidmFsdWUiOiJMaS1OTUMgMTExIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkJhdHRlcnkgQ2hlbWlzdHJ5IOKAlCBBbm9kZSIsInZhbHVlIjoiQ2FyYm9uIChncmFwaGl0ZSkiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiQmF0dGVyeSBDaGVtaXN0cnkg4oCUIEVsZWN0cm9seXRlIiwidmFsdWUiOiJMaVBGNiBpbiBFQy9ETUMvRU1DIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkNyaXRpY2FsIFJhdyBNYXRlcmlhbHMiLCJ2YWx1ZSI6Ii0gV3Vyc3QiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiU3Vic3RhbmNlIEltcGFjdCBBc3Nlc3NtZW50IiwidmFsdWUiOiItIExpdGhpdW0gYW5kIGVsZWN0cm9seXRlIChMaVBGNik6IGZsYW1tYWJsZSBhbmQgY29ycm9zaXZlIOKAlCByaXNrIG9mIGZpcmUvdGhlcm1hbCBydW5hd2F5IGlmIG1lY2hhbmljYWxseSBkYW1hZ2VkIG9yIHNob3J0LWNpcmN1aXRlZC5cbi0gQ29iYWx0IGNvbXBvdW5kcyAoQ28gaW4gTk1DIGNhdGhvZGUpOiBDYXJjLiAxQiAoSDM1MCkg4oCUIG1heSBjYXVzZSBjYW5jZXIgdmlhIGluaGFsYXRpb247IFJlcHIuIDFCIChIMzYwRikg4oCUIG1heSBkYW1hZ2UgZmVydGlsaXR5LlxuLSBOaWNrZWwgY29tcG91bmRzIChOaSBpbiBOTUMgY2F0aG9kZSk6IFNraW4gU2Vucy4gMSAoSDMxNykg4oCUIG1heSBjYXVzZSBhbGxlcmdpYyBza2luIHJlYWN0aW9uOyBDYXJjLiAyIChIMzUxKSDigJQgc3VzcGVjdGVkIG9mIGNhdXNpbmcgY2FuY2VyLlxuLSBFbnZpcm9ubWVudGFsIGltcGFjdDogaW5hcHByb3ByaWF0ZSBkaXNwb3NhbCAobGl0dGVyaW5nLCB1bnNvcnRlZCBtdW5pY2lwYWwgd2FzdGUpIGNhbiBsZWFkIHRvIHNvaWwgYW5kIHdhdGVyIGNvbnRhbWluYXRpb24gd2l0aCBoZWF2eSBtZXRhbHMuIFByb3BlciBzZXBhcmF0ZSBjb2xsZWN0aW9uIGFuZCByZWN5Y2xpbmcgaXMgbWFuZGF0b3J5LiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJNYXRlcmlhbHMgKENhdGhvZGUgLyBBbm9kZSAvIEVsZWN0cm9seXRlKSIsInZhbHVlIjoiLSBMaU5pMC4zM01uMC4zM0NvMC4zM08yIChOTUMgMTExLCBsaXRoaXVtIG5pY2tlbCBtYW5nYW5lc2UgY29iYWx0IG94aWRlKTogMC40NSBrZ1xuLSBBbHVtaW51bSBjdXJyZW50IGNvbGxlY3RvciAoQWwsIENBUyA3NDI5LTkwLTUpOiAwLjA1IGtnXG4tIFBWREYgYmluZGVyIChwb2x5dmlueWxpZGVuZSBmbHVvcmlkZSwgQ0FTIDI0OTM3LTc5LTkpOiAwLjA1IGtnXG4tIENhcmJvbiBibGFjayBjb25kdWN0aXZlIGFkZGl0aXZlIChDQVMgMTMzMy04Ni00KTogMC4wNSBrZ1xuLSBHcmFwaGl0ZSAobmF0dXJhbCBhbmQgc3ludGhldGljIGJsZW5kLCBDQVMgNzc4Mi00Mi01LCBFQyAyMzEtOTU1LTMpOiAwLjM4IGtnXG4tIENvcHBlciBjdXJyZW50IGNvbGxlY3RvciAoQ3UsIENBUyA3NDQwLTUwLTgpOiAwLjA1IGtnXG4tIENNQy9TQlIgYmluZGVyIChjYXJib3h5bWV0aHlsIGNlbGx1bG9zZSAvIHN0eXJlbmUtYnV0YWRpZW5lIHJ1YmJlcik6IDAuMDUga2dcbi0gTGl0aGl1bSBoZXhhZmx1b3JvcGhvc3BoYXRlOiAwLjE1IGtnXG4tIEV0aHlsZW5lIGNhcmJvbmF0ZTogMC4wNSBrZ1xuLSBEaW1ldGh5bCBjYXJib25hdGU6IDAuMDUga2dcbi0gRXRoeWwgbWV0aHlsIGNhcmJvbmF0ZTogMC4wNSBrZ1xuLSBQUC9QRSAoUG9seXByb3B5bGVuZS9Qb2x5ZXRoeWxlbmUpIG1pY3JvcG9yb3VzIG1lbWJyYW5lOiAwLjA4IGtnXG4tIEFsdW1pbnVtIGFsbG95IGNhc2luZzogMC44NSBrZ1xuLSBBQlMgcGxhc3RpYyBjb3ZlcjogMC4wNSBrZyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiSGF6YXJkb3VzIFN1YnN0YW5jZXMiLCJ2YWx1ZSI6Ii0gKipMaXRoaXVtIGhleGFmbHVvcm9waG9zcGhhdGUgKExpUEY2KSoqLCBDb25jZW50cmF0aW9uOiB-My41JSB3ZWlnaHQgYnkgd2VpZ2h0LCBDQVM6IDIxMzI0LTQwLTMsIEVDOiAyNDQtMzM0LTdcbi0gKipDb2JhbHQgY29tcG91bmRzIChhcyBDbyBpbiBOTUMgY2F0aG9kZSkqKiwgQ29uY2VudHJhdGlvbjogfjExJSB3ZWlnaHQgYnkgd2VpZ2h0IChhcyBDbyBtZXRhbCksIENBUzogVmFyaW91cyAoTk1DIGNvbXBsZXgpLCBTVkhDOiB5ZXNcbi0gKipOaWNrZWwgY29tcG91bmRzIChhcyBOaSBpbiBOTUMgY2F0aG9kZSkqKiwgQ29uY2VudHJhdGlvbjogfjExJSB3ZWlnaHQgYnkgd2VpZ2h0IChhcyBOaSBtZXRhbCkiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfV19LHsidGl0bGUiOiLCpzYuNiBDaXJjdWxhcml0eSBhbmQgUmVzb3VyY2UgRWZmaWNpZW5jeSIsImRlc2NyaXB0aW9uIjoiRGlzbWFudGxpbmcgaW5mb3JtYXRpb24sIHJlY3ljbGVkIGNvbnRlbnQsIGFuZCBlbmQtdXNlciBpbmZvcm1hdGlvbiIsImF0dHJpYnV0ZXMiOlt7InRpdGxlIjoiUmVtb3ZhbCBNYW51YWwiLCJ2YWx1ZSI6Imh0dHBzOi8vZWVjYy5kZS9kb2NzL2JhdHRlcnktcmVtb3ZhbC1tYW51YWwucGRmIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJyZXN0cmljdGVkIl19LHsidGl0bGUiOiJEaXNhc3NlbWJseSBNYW51YWwiLCJ2YWx1ZSI6Imh0dHBzOi8vZWVjYy5kZS9kb2NzL2JhdHRlcnktZGlzYXNzZW1ibHktbWFudWFsLnBkZiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiU2FmZXR5IE1lYXN1cmVzIiwidmFsdWUiOiJodHRwczovL2VlY2MuZGUvZG9jcy9zYWZldHktaW5zdHJ1Y3Rpb25zLnBkZiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiU3BhcmUgUGFydHMgKFBhcnQgTnVtYmVycykiLCJ2YWx1ZSI6Ii0gQkFULUNFTEwtTU9EVUxFXG4tIEJNUy0wMDFcbi0gQ09OTkVDVE9SLTAwMVxuLSBIT1VTSU5HLUxPV0VSXG4tIEhPVVNJTkctVVBQRVIiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInJlc3RyaWN0ZWQiXX0seyJ0aXRsZSI6IlNwYXJlIFBhcnRzIChQb3N0YWwgQWRkcmVzcykiLCJ2YWx1ZSI6IkJ1c3NhcmR3ZWcgMTgsIDQxNDY4IE5ldXNzLCBERSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiU3BhcmUgUGFydHMgKEVtYWlsKSIsInZhbHVlIjoic2ViYXN0aWFuLnNjaG1pdHRuZXJAZWVjYy5kZSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiU3BhcmUgUGFydHMgKFdlYikiLCJ2YWx1ZSI6Imh0dHBzOi8vZWVjYy5kZS9zcGFyZS1wYXJ0cyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiUmVuZXdhYmxlIENvbnRlbnQgU2hhcmUiLCJ2YWx1ZSI6IjAgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJXYXN0ZSBQcmV2ZW50aW9uIExpbmsiLCJ2YWx1ZSI6Imh0dHBzOi8vZWVjYy5kZS9kb2NzL3dhc3RlLXByZXZlbnRpb24tYmVzdC1wcmFjdGljZXMucGRmIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IlNlcGFyYXRlIENvbGxlY3Rpb24gTGluayIsInZhbHVlIjoiaHR0cHM6Ly9lZWNjLmRlL2RvY3MvYmF0dGVyeS1jb2xsZWN0aW9uLWd1aWRlLnBkZiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJDb2xsZWN0aW9uIGFuZCBUcmVhdG1lbnQgTGluayIsInZhbHVlIjoiaHR0cHM6Ly9lZWNjLmRlL2RvY3MvY29sbGVjdGlvbi1wb2ludHMtYW5kLXRyZWF0bWVudC5wZGYiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiUmVjeWNsZWQgTmlja2VsIChQcmUtY29uc3VtZXIpIiwidmFsdWUiOiIwICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiUmVjeWNsZWQgQ29iYWx0IChQcmUtY29uc3VtZXIpIiwidmFsdWUiOiIwICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiUmVjeWNsZWQgTGl0aGl1bSAoUHJlLWNvbnN1bWVyKSIsInZhbHVlIjoiMCAlIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IlJlY3ljbGVkIExlYWQgKFByZS1jb25zdW1lcikiLCJ2YWx1ZSI6IjAgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJSZWN5Y2xlZCBOaWNrZWwgKFBvc3QtY29uc3VtZXIpIiwidmFsdWUiOiIwICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiUmVjeWNsZWQgQ29iYWx0IChQb3N0LWNvbnN1bWVyKSIsInZhbHVlIjoiMCAlIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IlJlY3ljbGVkIExpdGhpdW0gKFBvc3QtY29uc3VtZXIpIiwidmFsdWUiOiIwICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiUmVjeWNsZWQgTGVhZCAoUG9zdC1jb25zdW1lcikiLCJ2YWx1ZSI6IjAgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19XX0seyJ0aXRsZSI6IsKnNi43IFBlcmZvcm1hbmNlIGFuZCBEdXJhYmlsaXR5IiwiZGVzY3JpcHRpb24iOiJDYXBhY2l0eSwgdm9sdGFnZSwgcG93ZXIsIGVmZmljaWVuY3ksIGludGVybmFsIHJlc2lzdGFuY2UsIGxpZmV0aW1lLCBhbmQgdGVtcGVyYXR1cmUgc3BlY2lmaWNhdGlvbnMiLCJhdHRyaWJ1dGVzIjpbeyJ0aXRsZSI6IlJhdGVkIENhcGFjaXR5IiwidmFsdWUiOiIxMCBBaCIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJDYXBhY2l0eSBGYWRlIiwidmFsdWUiOiIwICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInJlc3RyaWN0ZWQiXX0seyJ0aXRsZSI6Ik1pbmltdW0gVm9sdGFnZSIsInZhbHVlIjoiMzAgViIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJOb21pbmFsIFZvbHRhZ2UiLCJ2YWx1ZSI6IjM2IFYiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiTWF4aW11bSBWb2x0YWdlIiwidmFsdWUiOiI0MiBWIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik9yaWdpbmFsIFBvd2VyIENhcGFiaWxpdHkiLCJ2YWx1ZSI6IjI1MCBXIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6Ik1heGltdW0gUGVybWl0dGVkIEJhdHRlcnkgUG93ZXIiLCJ2YWx1ZSI6IjUwMCBXIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IlBvd2VyIEZhZGUiLCJ2YWx1ZSI6IjAgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiUmF0aW8gTm9taW5hbCBQb3dlciB0byBFbmVyZ3kiLCJ2YWx1ZSI6IuKAlCBXL1doIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkluaXRpYWwgUm91bmQtVHJpcCBFbmVyZ3kgRWZmaWNpZW5jeSIsInZhbHVlIjoiOTAgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJSb3VuZC1UcmlwIEVmZmljaWVuY3kgYXQgNTAlIEN5Y2xlIExpZmUiLCJ2YWx1ZSI6Ijg4ICUiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiRW5lcmd5IEVmZmljaWVuY3kgRmFkZSIsInZhbHVlIjoiMCAlIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJyZXN0cmljdGVkIl19LHsidGl0bGUiOiJJbml0aWFsIFNlbGYtRGlzY2hhcmdlIFJhdGUiLCJ2YWx1ZSI6IjIuNSAlL21vbnRoIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJyZXN0cmljdGVkIl19LHsidGl0bGUiOiJJbml0aWFsIEludGVybmFsIFJlc2lzdGFuY2UgKFBhY2spIiwidmFsdWUiOiIwLjEyIM6pIiwibGV2ZWwiOiJwcm9kdWN0IiwidmlzaWJpbGl0eSI6WyJwdWJsaWMiXX0seyJ0aXRsZSI6IkluaXRpYWwgSW50ZXJuYWwgUmVzaXN0YW5jZSAoQ2VsbCkiLCJ2YWx1ZSI6IjAuMDMgzqkiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiSW50ZXJuYWwgUmVzaXN0YW5jZSBJbmNyZWFzZSAoUGFjaykiLCJ2YWx1ZSI6IjEgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiSW50ZXJuYWwgUmVzaXN0YW5jZSBJbmNyZWFzZSAoQ2VsbCkiLCJ2YWx1ZSI6IjEgJSIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiRXhwZWN0ZWQgTGlmZXRpbWUgKENhbGVuZGFyIFllYXJzKSIsInZhbHVlIjoiNSIsInZhbHVlRGVzY3JpcHRpb24iOiJ5ZWFycyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicmVzdHJpY3RlZCJdfSx7InRpdGxlIjoiRXhwZWN0ZWQgTGlmZXRpbWUgKENoYXJnZS9EaXNjaGFyZ2UgQ3ljbGVzKSIsInZhbHVlIjoiODAwIiwidmFsdWVEZXNjcmlwdGlvbiI6ImN5Y2xlcyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJDeWNsZSBMaWZlIFJlZmVyZW5jZSBUZXN0IiwidmFsdWUiOiJJRUMgNjI2MTk6MjAyMiIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJDLVJhdGUgb2YgQ3ljbGUgTGlmZSBUZXN0IiwidmFsdWUiOiIwLjUgQyIsImxldmVsIjoicHJvZHVjdCIsInZpc2liaWxpdHkiOlsicHVibGljIl19LHsidGl0bGUiOiJUZW1wZXJhdHVyZSBSYW5nZSBJZGxlIFN0YXRlIChMb3dlcikiLCJ2YWx1ZSI6Ii0yMCDCsEMiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfSx7InRpdGxlIjoiVGVtcGVyYXR1cmUgUmFuZ2UgSWRsZSBTdGF0ZSAoVXBwZXIpIiwidmFsdWUiOiI2MCDCsEMiLCJsZXZlbCI6InByb2R1Y3QiLCJ2aXNpYmlsaXR5IjpbInB1YmxpYyJdfV19XSwia2V5QXV0aG9yaXphdGlvbiI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjL2xpY2Vuc2UvZ3MxX2tleS8wMS8wNDA0NzExMTAwMDAwNiJ9LCJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3ZjLzJiNWNlZGNhLWYxOGItNDdhZS1iOWRjLWZlMzZiODJkZDk2ZCIsInZhbGlkRnJvbSI6IjIwMjYtMDMtMDlUMjM6NTU6MjlaIiwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vY29tcGFueS13YWxsZXQtZGV2LnByb2QtazhzLmVlY2MuZGUvYXBpL3JlZ2lzdHJ5L3N0YXR1cy9yZXZvY2F0aW9uLzJhNmFmZGI5LWU2MzItNGE0My05YzMxLTY4MzkzMGY4MjI4NCM4NTMwNCIsInR5cGUiOiJCaXRzdHJpbmdTdGF0dXNMaXN0RW50cnkiLCJzdGF0dXNQdXJwb3NlIjoicmV2b2NhdGlvbiIsInN0YXR1c0xpc3RJbmRleCI6Ijg1MzA0Iiwic3RhdHVzTGlzdENyZWRlbnRpYWwiOiJodHRwczovL2NvbXBhbnktd2FsbGV0LWRldi5wcm9kLWs4cy5lZWNjLmRlL2FwaS9yZWdpc3RyeS9zdGF0dXMvcmV2b2NhdGlvbi8yYTZhZmRiOS1lNjMyLTRhNDMtOWMzMS02ODM5MzBmODIyODQifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vaWQuZ3MxLm9yZy92Yy9zY2hlbWEvdjEvcHJvZHVjdGRhdGEiLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3czaWQub3JnL3ZjL3JlbmRlci1tZXRob2QvdjEiLCJodHRwczovL3JlZi5nczEub3JnL2dzMS92Yy9kZWNsYXJhdGlvbi1jb250ZXh0IiwiaHR0cHM6Ly9yZWYuZ3MxLm9yZy9nczEvdmMvcHJvZHVjdC1jb250ZXh0Il0sInJlbmRlck1ldGhvZCI6W3sibmFtZSI6IlNWRyBmb3Igd2ViIGRpc3BsYXkiLCJ0eXBlIjoiVGVtcGxhdGVSZW5kZXJNZXRob2QiLCJyZW5kZXJTdWl0ZSI6InN2Zy1tdXN0YWNoZSIsInRlbXBsYXRlIjp7ImlkIjoiaHR0cHM6Ly9wcC5kcHAtd2wucHJvZC1rOHMuZWVjYy5kZS90ZW1wbGF0ZXMvcHJvZHVjdC1kYXRhLWNyZWRlbnRpYWwtdGVtcGxhdGUuc3ZnIiwibWVkaWFUeXBlIjoiaW1hZ2Uvc3ZnK3htbCJ9fV0sIm5hbWUiOiJQcm9kdWt0ZGF0ZW4tWmVydGlmaWthdCIsImRlc2NyaXB0aW9uIjoiRGVyIEF1c3N0ZWxsZXIgZGllc2VzIFplcnRpZmlrYXRzIGJlc3TDpHRpZ3QsIGRhc3MgZGllIFByb2R1a3RkYXRlbiBrb3JyZWt0IHVuZCBhdXRoZW50aXNjaCBzaW5kLiIsImlhdCI6MTc3MzEwMDUzMH0.LFWopwX2k3Mz7u8UnxFfb13Qt6YsHaSfI1lS0ki6fAcMTnyLRJ1RtmX44I3gwlBctWyRnACYdgJNlm-IlQKjFQ";

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/04047111000006
// linked from productDataCredential.credentialSubject.keyAuthorization
const keyCredential: any = {"type":["VerifiableCredential","KeyCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:55:27Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#bpp_vc_issuance","proofPurpose":"assertionMethod","proofValue":"z3Xq8arxCDkYTs5pxTZPZapi7YyTtvfYR2u3jdNjYbNKhrxfV3f7SXXqGPE95QA2p3jNiGVPc15YjVoEuuftS11bS","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc","name":"EECC"},"credentialSubject":{"id":"https://id.company-wallet-dev.prod-k8s.eecc.de/01/04047111000006","extendsCredential":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111"},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/04047111000006","validFrom":"2026-03-09T23:55:25Z","credentialStatus":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284#96149","type":"BitstringStatusListEntry","statusPurpose":"revocation","statusListIndex":"96149","statusListCredential":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284"},"credentialSchema":{"id":"https://id.gs1.org/vc/schema/v1/key","type":"JsonSchema"},"@context":["https://www.w3.org/ns/credentials/v2","https://ref.gs1.org/gs1/vc/license-context","https://ref.gs1.org/gs1/vc/declaration-context","https://raw.githubusercontent.com/european-epc-competence-center/jsonld-context/refs/heads/main/context/render-method"],"renderMethod":[{"type":"TemplateRenderMethod","name":"SVG for web display","renderSuite":"svg-mustache","template":{"mediaType":"image/svg+xml","id":"https://gs1.github.io/GS1DigitalLicenses/templates/gs1-sample-key-template.svg"}}],"name":"GS1 ID Key Credential","description":"Declares the cryptographic key associated with a GS1 identifier, enabling secure digital signatures and verification of GS1-related transactions. This credential extends from a Company Prefix License and binds a specific cryptographic key to a GS1 identifier, ensuring the authenticity and integrity of data associated with products, locations, or entities identified by GS1 standards."};

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111
// linked from keyCredential.credentialSubject.extendsCredential
const companyPrefixLicenseCredential: any = {"type":["VerifiableCredential","GS1CompanyPrefixLicenseCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:54:48Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#no_secret","proofPurpose":"assertionMethod","proofValue":"z2jJmaJ8QArfCwhb7dW4n6fymsXJ2k1YBHSACt7rdaiirfUjgvaKXMtmgBkPQrHQ2aC4g8J6ZyVLLS9AodMp1boWs","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany","name":"GS1 Germany"},"credentialSubject":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc","extendsCredential":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40","licenseValue":"4047111","organization":{"gs1:partyGLN":"4047111000006","gs1:organizationName":"EECC"}},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111","validFrom":"2026-03-09T23:54:08Z","credentialStatus":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a#8750","type":"BitstringStatusListEntry","statusPurpose":"revocation","statusListIndex":"8750","statusListCredential":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a"},"credentialSchema":{"id":"https://id.gs1.org/vc/schema/v1/companyprefix","type":"JsonSchema"},"@context":["https://www.w3.org/ns/credentials/v2","https://ref.gs1.org/gs1/vc/license-context","https://raw.githubusercontent.com/european-epc-competence-center/jsonld-context/refs/heads/main/context/render-method"],"renderMethod":[{"type":"TemplateRenderMethod","name":"SVG for web display","renderSuite":"svg-mustache","template":{"mediaType":"image/svg+xml","id":"https://gs1.github.io/GS1DigitalLicenses/templates/gs1-sample-license-template.svg"}}],"name":"GS1 Company Prefix License","description":"Authorizes a member company to use a specific GS1 Company Prefix for creating globally unique product identifiers. Issued by a Member Organization to companies within their region, this credential extends from a GS1 Prefix License and enables the company to generate GTINs, GLNs, and other GS1 identification keys for their products, locations, and business entities. Essential for supply chain traceability and global commerce."};

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40
// linked from companyPrefixLicenseCredential.credentialSubject.extendsCredential
const prefixLicenseCredential: any = {"type":["VerifiableCredential","GS1PrefixLicenseCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:47:51Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#no_secret","proofPurpose":"assertionMethod","proofValue":"z2PWtVBL2GSs1iRXgAjZeFLss1eeZEhm1Prie7E5om7hxeXxhNxkTV5m9uwsYDbubiAKsAdrzUmFnmPUK1zvcsT2a","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global","name":"GS1 Global"},"credentialSubject":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany","licenseValue":"40","organization":{"gs1:partyGLN":"4000001000005","gs1:organizationName":"GS1 Germany"}},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40","validFrom":"2026-03-09T23:47:31Z","credentialStatus":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282#119320","type":"BitstringStatusListEntry","statusPurpose":"revocation","statusListIndex":"119320","statusListCredential":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282"},"credentialSchema":{"id":"https://id.gs1.org/vc/schema/v1/prefix","type":"JsonSchema"},"@context":["https://www.w3.org/ns/credentials/v2","https://ref.gs1.org/gs1/vc/license-context","https://raw.githubusercontent.com/european-epc-competence-center/jsonld-context/refs/heads/main/context/render-method"],"renderMethod":[{"type":"TemplateRenderMethod","name":"SVG for web display","renderSuite":"svg-mustache","template":{"mediaType":"image/svg+xml","id":"https://gs1.github.io/GS1DigitalLicenses/templates/gs1-sample-license-template.svg"}}],"name":"GS1 Prefix License","description":"Verifies the authorized assignment of a GS1 prefix to a Member Organization by GS1 Global. This credential establishes the foundational authority that enables the Member Organization to issue Company Prefix Licenses to member companies within their geographic region or market sector. The prefix forms the basis for creating globally unique identifiers in the GS1 system."};

// Status list credentials:
// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284
// shared by productDataCredential and keyCredential (both issued by did:eecc)
const eeccStatusList: any = {"type":["VerifiableCredential","BitstringStatusListCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:55:26Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#bpp_vc_issuance","proofPurpose":"assertionMethod","proofValue":"z5ivq312yLi2UHBjXpsR1wW6RzadPuxvJJQfXDTpZD1CxvD5iewviaPzREHD6HTM5cJpsTEGyBwcCGs6A41NP7rcc","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc","name":"EECC"},"credentialSubject":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284#list","statusPurpose":"revocation","type":"BitstringStatusList","encodedList":"H4sIAAAAAAAA_-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284","@context":["https://www.w3.org/ns/credentials/v2","https://www.w3.org/ns/credentials/status/v1"]};

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a
// for companyPrefixLicenseCredential (issued by did:gs1_germany)
const gs1GermanyStatusList: any = {"type":["VerifiableCredential","BitstringStatusListCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:54:47Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#no_secret","proofPurpose":"assertionMethod","proofValue":"z3Yq2trr5jWAhSLNsjC8WcekYXDdH2k4LYCimYnLy79hzebG1feaUzDVfGaoUBqquR9hzdVgEKHghreq6RQt1wwnc","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany","name":"GS1 Germany"},"credentialSubject":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a#list","statusPurpose":"revocation","type":"BitstringStatusList","encodedList":"H4sIAAAAAAAA_-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a","@context":["https://www.w3.org/ns/credentials/v2","https://www.w3.org/ns/credentials/status/v1"]};

// url: https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282
// for prefixLicenseCredential (issued by did:gs1_global)
const gs1GlobalStatusList: any = {"type":["VerifiableCredential","BitstringStatusListCredential"],"proof":{"type":"DataIntegrityProof","created":"2026-03-09T23:47:50Z","verificationMethod":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#no_secret","proofPurpose":"assertionMethod","proofValue":"z22eEcjHtam4JkDAEaYGcRtHGftJfzwSkLBM9ipYweH8EjPU876PtyTiZMPsnHbwy2T7B9KW8kfuL5mVZpvimWtAd","cryptosuite":"ecdsa-rdfc-2019"},"issuer":{"id":"did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global","name":"GS1 Global"},"credentialSubject":{"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282#list","statusPurpose":"revocation","type":"BitstringStatusList","encodedList":"H4sIAAAAAAAA_-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"},"id":"https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282","@context":["https://www.w3.org/ns/credentials/v2","https://www.w3.org/ns/credentials/status/v1"]};


// DID documents:
// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/eecc
// issues productDataCredential (JWT, #bpp_vc_issuance), keyCredential (DataIntegrityProof, #bpp_vc_issuance), and eeccStatusList
const did_eecc: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#key-1",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"4ykM8ilKz9ebvOouOg477iLIxGlIJYO_4dGTYPuNF5Q","y":"_0PZWyl-DHLRLbkzlsQnw2B3vGO03QCzWICbFxUq5E8","crv":"P-256"}
        },
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#bpp_vc_issuance",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"p41e6X6rMB9Kz76yigwqnJpZZFZtv57O4MSk3l0Gxpo","y":"XYAm9WLnBIJ-hS3rOh3GVVZXv8JsunXB1jevG24EFqY","crv":"P-256"}
        }
    ],
    "controller": ["did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc"],
    "@context": ["https://www.w3.org/ns/did/v1"],
    "assertionMethod": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#key-1",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#bpp_vc_issuance"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#key-1",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc#bpp_vc_issuance"
    ]
};

// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/gs1_germany
// issues companyPrefixLicenseCredential and gs1GermanyStatusList (both use #no_secret)
const did_gs1_germany: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#companyPrefix",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"lwYpy5xWe2R03U7wug9GnPfGBM8Q1QCcEiZSnUIgfKA","y":"K2GG7n0flxhb_O9o_kSS_wS7srZeellrKyoREaCILnc","crv":"P-256"}
        },
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#no_secret",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"5Mu0oSBI4bprEDXfBGtN50Ow0ucqip5BSH4l6tMC8SA","y":"VRE3WAOvCYDAvWJ5143yG0Dp0wGlvMFg3RB6zAF_qRk","crv":"P-256"}
        }
    ],
    "controller": ["did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany"],
    "@context": ["https://www.w3.org/ns/did/v1"],
    "assertionMethod": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#companyPrefix",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#no_secret"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany#no_secret"
    ]
};

// url (resolved): https://company-wallet-dev.prod-k8s.eecc.de/api/registry/did/gs1_global
// issues prefixLicenseCredential and gs1GlobalStatusList (both use #no_secret)
const did_gs1_global: any = {
    "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
    "verificationMethod": [
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"P2lWAfthH4udmM2h0-Mx6kPpr69o9n9CXLdFzXN0YhI","y":"mLU90jewX5K-cxtuaxGcpXRqTEQrr1-4FqZ_AQ1fcqo","crv":"P-256"}
        },
        {
            "id": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#no_secret",
            "type": "JsonWebKey",
            "controller": "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global",
            "publicKeyJwk": {"key_ops":["verify"],"ext":true,"kty":"EC","x":"qfxjZw8r3belX3jEgQ2j1y78YJaGlrMJbtyZ7x13Mzo","y":"XHHmQokKOiNSjE8KMjwigiHZdtNM1RL5Dtg0lpdlCIU","crv":"P-256"}
        }
    ],
    "controller": ["did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global"],
    "@context": ["https://www.w3.org/ns/did/v1"],
    "assertionMethod": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#no_secret"
    ],
    "authentication": [
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#secure-prefix",
        "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_global#no_secret"
    ]
};

function resolveDIDFragment(didDocument: any, fragmentId: string) {
    const verificationMethod = didDocument.verificationMethod?.find((vm: any) =>
        vm.id.endsWith(`#${fragmentId}`)
    );

    if (verificationMethod) {
        return verificationMethod;
    }

    return didDocument;
}

const { documentLoader: realDocumentLoader } = (await import("../src/services/documentLoader/index")) as any;

await jest.unstable_mockModule("../src/services/documentLoader/index", () => ({
    documentLoader: jest.fn().mockImplementation(async (url: any) => {
        if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/2b5cedca-f18b-47ae-b9dc-fe36b82dd96d") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: productDataCredentialAsJwt
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_key/01/04047111000006") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: keyCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/4047111") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: companyPrefixLicenseCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/vc/license/gs1_prefix/40") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: prefixLicenseCredential
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/2a6afdb9-e632-4a43-9c31-683930f82284") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: eeccStatusList
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/b62c5591-5d85-4b91-abb0-816a326b0c7a") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1GermanyStatusList
            };
        } else if (url === "https://company-wallet-dev.prod-k8s.eecc.de/api/registry/status/revocation/6a653675-887b-4256-9332-dd71c3add282") {
            return {
                contextUrl: null,
                documentUrl: url,
                document: gs1GlobalStatusList
            };
        }

        if (url.startsWith("did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:")) {
            const [didUrl, fragment] = url.split('#');

            if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:eecc") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_eecc, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_eecc
                    };
                }
            } else if (didUrl === "did:web:company-wallet-dev.prod-k8s.eecc.de:api:registry:did:gs1_germany") {
                if (fragment) {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: resolveDIDFragment(did_gs1_germany, fragment)
                    };
                } else {
                    return {
                        contextUrl: null,
                        documentUrl: url,
                        document: did_gs1_germany
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

        // Fall through to real document loader for JSON-LD contexts and other static documents
        return realDocumentLoader(url);
    })
}));

// Import modules after mocking
import request from "supertest";
// Global server variable
let server: any;

describe("Verifier API Regression Test for ProductDataCredential (base64url JWT)", () => {

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

    test("Verify revoked ProductDataCredential JWT with full GS1 chain via GS1 endpoint", async () => {
        const res = await request(server)
            .post("/api/verifier/gs1")
            .send([productDataCredentialAsJwt]);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);

        const result = res.body[0];
        expect(result.gs1Result.verified).toBe(true);
        expect(result.statusResult.verified).toBe(false);
        expect(result.results[0].verified).toBe(true);
    });

});
