import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class Emfff2022Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const STAGE = process.env.STAGE || 'dev'

    // defines an AWS Lambda resource
    const feed = new lambda.Function(this, "feed", {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambdas/feed'),
      handler: 'feed.handler'                // file is "hello", function is "handler"
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    //const apigwDeployment = new apigw.LambdaRestApi(this, "feed-endpoint", {
    //  handler: programme
    //});

    // IMPORTANT: Lambda grant invoke to APIGateway
    feed.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

    // Then, create the API construct, integrate with lambda
    const api = new apigw.RestApi(this, 'feed_api', { deploy: false });
    const integration = new apigw.LambdaIntegration(feed);
    api.root.addMethod('GET', integration)

    // Then create an explicit Deployment construct
    const deployment  = new apigw.Deployment(this, 'feed_deployment', { api });

    // And different stages
    const [devStage, prodStage] = ['dev', 'v1'].map(item => 
      new apigw.Stage(this, `${item}_stage`, { deployment, stageName: item }));

    api.deploymentStage = prodStage

  }
}
