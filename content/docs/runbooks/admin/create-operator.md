
# How to Create an Operator from Scratch
This is a step-by-step walk through of the creation of an operator using the KUDO cli to generate the operator structure.

## Preconditions

None

## Steps

### Create the Core Operator Structure

```
# create operator folder
mkdir first-operator
cd first-operator
kubectl kudo package new first-operator
```

This creates the main structure of the operator which can be view with `tree`

```
tree .
.
└── operator
    ├── operator.yaml
    └── params.yaml
```

**note:** use the `-i` mode to be prompted interactively for operator details.

### Add a Maintainer

`kubectl kudo package add maintainer "your name" your@email.com`

### Add a Task

`kubectl kudo package add task`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add task
Task Name: app
✔ Apply
Task Resource: deployment
✗ Add another Resource:
```

### Add a Plan

`kubectl kudo package add plan`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add plan
✔ Plan Name: deploy
✔ serial
Phase 1 name: main
✔ parallel
Step 1 name: everything
✔ app
✗ Add another Task:
✗ Add another Step:
✗ Add another Phase:
```

### Add a Parameter

`kubectl kudo package add parameter`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add parameter
Parameter Name: replicas
Default Value: 2
Display Name:
Description: Number of replicas that should be run as part of the deployment
✔ false
✗ Add Trigger Plan:
```

These steps have created the entirety of the first-operator with the exception of the details in the `template/deployment.yaml` file.  To complete this operator execute the following.

```
cat << EOF > operator/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: {{ .Params.replicas }}
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.7.9
          ports:
            - containerPort: 80
EOF
```
