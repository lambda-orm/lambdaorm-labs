FROM nginx:latest
RUN apt-get update
# install and configure Firewall
RUN apt-get install ufw -y
RUN ufw default deny incoming
RUN ufw default allow outgoing
RUN ufw allow ssh
RUN ufw allow 9200/tcp
# RUN ufw enable
# nginx user
# USER 101 