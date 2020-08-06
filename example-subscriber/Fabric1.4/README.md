# ChainFaaS Blockchain Network (Hyperledger Fabric)

### Prerequisites and setup:

* [Docker](https://www.docker.com/products/overview) - v1.12 or higher:
* [Docker Compose](https://docs.docker.com/compose/overview/) - v1.8 or higher
* [Git client](https://git-scm.com/downloads) - needed for clone commands
* **Node.js** v8.4.0 or higher

To install all the prerequisites, run the setup.sh script.

**Note:** Since docker containers can get big in HF, if you want to run docker on a hard disk other than the default one, run the following command with the path on which the hard drive is mounted on. 

``` bash
sudo systemctl stop docker

echo '
{
  "graph":"/mnt/docker"
}
' | sudo tee /etc/docker/daemon.json

sudo systemctl start docker
```

### Start the network

To start the network, run the runApp.sh script.

