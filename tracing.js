const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
// Jaeger Exporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

module.exports = (serviceName) => {
   // Configure the Jaeger Exporter
   const exporter = new JaegerExporter({
       serviceName: serviceName, // This should match the service name in Jaeger UI
       endpoint: 'http://localhost:14268/api/traces', // Default Jaeger endpoint
   });

   // Configure the Node Tracer Provider
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // Set service name
       }),
   });

   // Add the Jaeger Exporter as a Span Processor
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
   provider.register();

   // Register Instrumentations (HTTP, Express, MongoDB)
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   // Return the tracer instance
   return trace.getTracer(serviceName);
};

