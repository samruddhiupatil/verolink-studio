import type { ComponentType } from 'react'
import { AuthenticationPage } from '../features/authentication/AuthenticationPage'
import { ConnectorIdentityPage } from '../features/connector-identity/ConnectorIdentityPage'
import { EndpointLibraryPage } from '../features/endpoint-library/EndpointLibraryPage'
import { FieldMappingPage } from '../features/field-mapping/FieldMappingPage'
import { OutboundFormsPage } from '../features/outbound-forms/OutboundFormsPage'
import { TestConsolePage } from '../features/test-console/TestConsolePage'

export interface RouteConfigEntry {
  path: string
  label: string
  Component: ComponentType
}

/** Single source of truth for both the sidebar nav and the router's route table. */
export const ROUTES: RouteConfigEntry[] = [
  { path: '/', label: 'Connector Identity', Component: ConnectorIdentityPage },
  { path: '/authentication', label: 'Authentication', Component: AuthenticationPage },
  { path: '/endpoints', label: 'Endpoint Library', Component: EndpointLibraryPage },
  { path: '/test-console', label: 'Test Console', Component: TestConsolePage },
  { path: '/field-mapping', label: 'Field Mapping', Component: FieldMappingPage },
  { path: '/outbound-form', label: 'Outbound Form', Component: OutboundFormsPage },
]
