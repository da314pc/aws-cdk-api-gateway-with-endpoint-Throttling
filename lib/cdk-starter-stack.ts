import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'api', {
      description: 'example api gateway',
      deployOptions: {
        // this enables caching on our api gateway, with a ttl of five minutes (unless overridden per method)
        cachingEnabled: true,
        cacheClusterEnabled: true,
        cacheDataEncrypted: true,
        stageName: "dev",
        dataTraceEnabled: true,
        cacheTtl: cdk.Duration.minutes(5),
        throttlingBurstLimit: 100,
        throttlingRateLimit: 100,
        tracingEnabled: true,
        metricsEnabled: true,
        // Method deployment options for specific resources/methods. (override common options defined in `StageOptions#methodOptions`)
        methodOptions: {
            "/todos/GET": {
                throttlingRateLimit: 10,
                throttlingBurstLimit: 10,
                cacheDataEncrypted: true,
                cachingEnabled: true,
                cacheTtl: cdk.Duration.minutes(10),
                dataTraceEnabled: true,
                metricsEnabled: true,
            },
            "/todos/{todoId}/GET": {
                throttlingRateLimit: 20,
                throttlingBurstLimit: 20,
                cachingEnabled: true,
                cacheDataEncrypted: true,
                cacheTtl: cdk.Duration.minutes(1),
                dataTraceEnabled: true,
                metricsEnabled: true,
            },
        },
      },
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    // 👇 create an Output for the API URL
    new cdk.CfnOutput(this, 'apiUrl', {value: api.url});

    // 👇 define get todos function
    const getTodosLambda = new lambda.Function(this, 'get-todos-lambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/get-todos')),
    });

    // 👇 add a /todos resource
    const todos = api.root.addResource('todos');

    // 👇 integrate GET /todos with getTodosLambda
    todos.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getTodosLambda, {proxy: true}),
    );

    // 👇 define delete todo function
    const deleteTodoLambda = new lambda.Function(this, 'delete-todo-lambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/delete-todo')),
    });

    // 👇 add a /todos/{todoId} resource
    const todo = todos.addResource('{todoId}');

    // 👇 integrate DELETE /todos/{todoId} with deleteTodosLambda
    todo.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteTodoLambda),
    );
  }
}
