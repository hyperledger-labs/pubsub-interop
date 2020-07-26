# install nodejs and npm
echo "Installing nodejs and npm"
sudo apt update
sudo apt -y install nodejs
sudo apt -y install npm

# install docker
echo "installing docker"
sudo apt-get update && sudo apt-get -y install docker.io

docker ps
sudo docker ps

sudo usermod -aG docker $USER
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "/home/$USER/.docker" -R
sudo chown "$USER":"$USER" /var/run/docker.sock
sudo chmod g+rwx /var/run/docker.sock -R
sudo systemctl enable docker

# install docker compose
echo "Installing docker compose"
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "You need to log out and log back in after these installations. If you are running on a VM you may need to restart your VM"
