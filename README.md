## Update

# Creating The API GATEWAY

Reference the file lib/cdk-starter-stack.ts

We created an API Gateway by instantiating the RestApi class.
We passed the following props to the RestApi construct:
description - a short description of the API Gateway resource

deployOptions - options for the deployment stage of the API. We updated the stage name of the API to dev. By default, the stageName is set to prod. The name of the stage is used in the API URL.

Inside of the deploy Options, there is a defintion methodOptions:

We will use these options to define settings for the endpoint that can be referenced inside of the gateway console.
For this repo I decided to set the throttling and burst limit for each endpoint at 10.

        methodOptions: {
          "/todos/GET": {
            throttlingRateLimit: 10,
            throttlingBurstLimit: 10,
            cacheDataEncrypted: true,
            cachingEnabled: true,
            cacheTtl: cdk.Duration.minutes(10),
            loggingLevel: apigw.MethodLoggingLevel.INFO,
            dataTraceEnabled: true,
            metricsEnabled: true,
          },
          "/todos/{todoId}/GET": {
            throttlingRateLimit: 20,
            throttlingBurstLimit: 20,
            cachingEnabled: true,
            cacheDataEncrypted: true,
            cacheTtl: cdk.Duration.minutes(1),
            loggingLevel: apigw.MethodLoggingLevel.INFO,
            dataTraceEnabled: true,
            metricsEnabled: true,
          },
        },

# [For more background reference please refer to this repo](https://github.com/bobbyhadz/aws-cdk-api-gateway-example)

## How to Use

1. Clone the repository

2. Install the dependencies

```bash
npm install
```

3. Create the CDK stack

```bash
npx aws-cdk deploy \
  --outputs-file ./cdk-outputs.json
```

4. Open the AWS CloudFormation Console and the stack should be created in your
   default region

5. Cleanup

```bash
npx aws-cdk destroy
```
