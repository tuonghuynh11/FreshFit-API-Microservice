import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { Resource } from '@opentelemetry/resources/build/src/Resource'

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

type JaegerExporterOptions = {
  url: string
}
const jaegerExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_URL || 'http://localhost:4317'
} as JaegerExporterOptions)

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'reporting-service'
  })
})

provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter))

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()]
})

provider.register()

console.log('Tracing initialized')
