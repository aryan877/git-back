import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { join } from "path";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class GithubS3BackupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "VPC", { isDefault: true });
    const cluster = new ecs.Cluster(this, "GitBackCluster");
    const backupImage = new DockerImageAsset(this, "BackupImage", {
      directory: join(__dirname, "..", "backup"),
    });

    const logGroup = new logs.LogGroup(this, "GitBackLogGroup", {
      logGroupName: "/ecs/github-s3-backup",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const backupTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "GitBackTaskDefinition",
      {
        cpu: 2048,
        memoryLimitMiB: 4096,
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.ARM64,
        },
      }
    );

    backupTaskDefinition.addContainer("GitBackContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(backupImage),
      logging: ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: "GitBack",
      }),
    });

    const backupTaskSecurityGroup = new ec2.SecurityGroup(
      this,
      "GitBackTaskSecurityGroup",
      {
        vpc,
        allowAllOutbound: true,
        description: "Security group for GitBack ECS task",
      }
    );

    new cdk.CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
      exportName: "ClusterName",
    });
    new cdk.CfnOutput(this, "ContainerName", {
      value: "GitBackContainer",
      exportName: "ContainerName",
    });
    new cdk.CfnOutput(this, "SecurityGroupId", {
      value: backupTaskSecurityGroup.securityGroupId,
      exportName: "SecurityGroupId",
    });
    new cdk.CfnOutput(this, "TaskDefinitionName", {
      value: backupTaskDefinition.taskDefinitionArn,
      exportName: "TaskDefinitionName",
    });
  }
}
