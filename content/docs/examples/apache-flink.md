---
title: Apache Flink
type: docs
---

# Apache Flink

A common use case for Apache Flink is streaming data analytics together with Apache Kafka, which provides a pub/sub model and durability for data streams. To achieve elastic scalability, both are typically deployed in clustered environments, and increasingly on top of container orchestration platforms like Kubernetes.

In this example we demonstrate how to orchestrate a streaming data analytics application based on Flink and Kafka with KUDO. It consists of a Flink job that checks financial transactions for fraud, and two microservices that generate and display the transactions. You can find more details about this demo in the [KUDO Operators repository](https://github.com/kudobuilder/operators/tree/master/repository/flink/docs/demo/financial-fraud), including instructions for installing the dependencies.

![Flink KUDO Architecture](/images/flink-kudo-architecture.png)

## Prerequisites

Follow the instructions on the [getting started page](../README.md) to install the `kubectl kudo` plugin and add KUDO to your cluster. Note that this demo starts quite a few things so you need a large enough cluster to run it successfully. The arguments for Minikube below have been verified to work:

```bash
$ minikube start --cpus=6 --memory=9216 --disk-size=10g
```

If you’re using a different way to provision Kubernetes, make sure you have at least 6 CPU Cores, 9 GB of RAM and 10 GB of disk space available.

For our demo, we use Kafka and Flink which depend on ZooKeeper. To make the ZooKeeper Operator available on the cluster, run:

```bash
$ kubectl kudo install zookeeper --operator-version=0.3.0 --skip-instance
```

The `--skip-instance` flag skips the creation of a ZooKeeper instance. The flink-demo Operator that we’re going to install below will create it as a dependency instead. Now let’s make the Kafka and Flink Operators available the same way:

```bash
$ kubectl kudo install kafka --operator-version=1.2.0 --skip-instance
```

```bash
$ kubectl kudo install flink --operator-version=0.2.1 --skip-instance
```

This installs all the Operator versions needed for our demo.

## Financial Fraud Demo

In our financial fraud demo we have two microservices, called “generator” and “actor”. The generator produces transactions with random amounts and writes them into a Kafka topic. Occasionally, the value will be over 10,000 which is considered fraud for the purpose of this demo. The Flink job subscribes to the Kafka topic and detects fraudulent transactions. When it does, it submits them to another Kafka topic which the actor consumes. The actor simply displays each fraudulent transaction.

The KUDO CLI by default installs Operators from the [official repository](https://github.com/kudobuilder/operators/), but it also supports installation from your local filesystem. This is useful if you want to develop your own Operator, or modify this demo for your own purposes.

First, clone the “kudobuilder/operators” repository via:

```bash
$ git clone https://github.com/kudobuilder/operators.git
```

Next, change into the “operators” directory and install the demo-operator from your local filesystem:

```bash
$ cd operators
$ kubectl kudo install repository/flink/docs/demo/financial-fraud/demo-operator --instance flink-demo
instance.kudo.dev/v1alpha1/flink-demo created
```

This time we didn’t include the `--skip-instance` flag, so KUDO will actually deploy all the components, including Flink, Kafka, and ZooKeeper. KUDO orchestrates deployments and other lifecycle operations using [plans](https://kudo.dev/docs/concepts.html#plan) that were defined by the Operator developer. Plans are similar to [runbooks](https://en.wikipedia.org/wiki/Runbook) and encapsulate all the procedures required to operate the software. We can track the status of the deployment using this KUDO command:

```bash
$ kubectl kudo plan status --instance flink-demo
Plan(s) for "flink-demo" in namespace "default":
.
└── flink-demo (Operator-Version: "flink-demo-0.1.4" Active-Plan: "deploy")
	└── Plan deploy (serial strategy) [IN_PROGRESS]
    	├── Phase dependencies [IN_PROGRESS]
    	│   ├── Step zookeeper (COMPLETE)
    	│   └── Step kafka (IN_PROGRESS)
    	├── Phase flink-cluster [PENDING]
    	│   └── Step flink (PENDING)
    	├── Phase demo [PENDING]
    	│   ├── Step gen (PENDING)
    	│   └── Step act (PENDING)
    	└── Phase flink-job [PENDING]
        	└── Step submit (PENDING)
```

The output shows that the “deploy” plan is in progress and that it consists of 4 phases: “dependencies”, “flink-cluster”, “demo” and “flink-job”. The “dependencies” phase includes steps for “zookeeper” and “kafka”. This is where both dependencies get installed, before KUDO continues to install the Flink cluster and the demo itself. We also see that ZooKeeper installation completed, and that Kafka installation is currently in progress. We can view details about Kafka’s deployment plan via:

```bash
$ kubectl kudo plan status --instance flink-demo-kafka
Plan(s) for "flink-demo-kafka" in namespace "default":
.
└── flink-demo-kafka (Operator-Version: "kafka-1.2.0" Active-Plan: "deploy")
    ├── Plan deploy (serial strategy) [IN_PROGRESS]
    │   └── Phase deploy-kafka [IN_PROGRESS]
    │       └── Step deploy (IN_PROGRESS)
    └── Plan not-allowed (serial strategy) [NOT ACTIVE]
        └── Phase not-allowed (serial strategy) [NOT ACTIVE]
            └── Step not-allowed (serial strategy) [NOT ACTIVE]
                └── not-allowed [NOT ACTIVE]
```

After Kafka was successfully installed the next phase “flink-cluster” will start and bring up, you guessed it, your flink-cluster. After this is done, the demo phase creates the generator and actor pods that generate and display transactions for this demo. Lastly, we have the flink-job phase in which we submit the actual FinancialFraudJob to the Flink cluster. Once the flink job is submitted, we will be able to see fraud logs in our actor pod shortly after.

After a while, the state of all plans, phases and steps will change to “COMPLETE”. Now we can view the Flink dashboard to verify that our job is running. To access it from outside the Kubernetes cluster, first start the client proxy, then open the URL below in your browser:

```bash
$ kubectl proxy
```

[http://127.0.0.1:8001/api/v1/namespaces/default/services/flink-demo-flink-jobmanager:ui/proxy/#/overview](http://127.0.0.1:8001/api/v1/namespaces/default/services/flink-demo-flink-jobmanager:ui/proxy/#/overview)

It should look similar to this, depending on your local machine and how many cores you have available:

![Flink Dashboard UI](/images/flink-dashboard-ui.png)

The job is up and running and we should now be able to see fraudulent transaction in the logs of the actor pod:

```bash
$ kubectl logs $(kubectl get pod -l actor=flink-demo -o jsonpath="{.items[0].metadata.name}")
Broker:   flink-demo-kafka-kafka-0.flink-demo-kafka-svc:9093
Topic:   fraud

Detected Fraud:   TransactionAggregate {startTimestamp=0, endTimestamp=1563395831000, totalAmount=19895:
Transaction{timestamp=1563395778000, origin=1, target='3', amount=8341}
Transaction{timestamp=1563395813000, origin=1, target='3', amount=8592}
Transaction{timestamp=1563395817000, origin=1, target='3', amount=2802}
Transaction{timestamp=1563395831000, origin=1, target='3', amount=160}}
```

If you add the `-f` flag to the previous command, you can follow along as more transactions are streaming in and are evaluated by our Flink job.
