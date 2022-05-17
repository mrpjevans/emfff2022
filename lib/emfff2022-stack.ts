import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class Emfff2022Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const feed = new lambda.Function(this, "emfff2022", {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambdas/emfff2022'),
      handler: 'emfff2022.handler'                // file is "hello", function is "handler"
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, "emfff2022-endpoint", {
      handler: feed,
      binaryMediaTypes: ['*/*']
    });

  }
}
