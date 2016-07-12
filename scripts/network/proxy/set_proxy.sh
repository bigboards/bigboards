#!/bin/bash
function usage() {
    echo "${0}"
    echo
}

rx='([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])'

echo -n "Please enter the address of your HTTP proxy server [eg. my-proxy.my-domain.com]: "
read HTTP_PROXY_HOST

echo -n "Please enter the port of your HTTP proxy server [eg. 8080]: "
read HTTP_PROXY_PORT

echo -n "Please enter the address of your HTTPS proxy server [eg. my-proxy.my-domain.com]: "
read HTTPS_PROXY_HOST

echo -n "Please enter the port of your HTTPS proxy server [eg. 8080]: "
read HTTPS_PROXY_PORT

ansible-playbook ./set_proxy.yml --extra-vars "http_proxy_host=${HTTP_PROXY_HOST} http_proxy_port=${HTTP_PROXY_PORT} https_proxy_host=${HTTPS_PROXY_HOST} https_proxy_port=${HTTPS_PROXY_PORT}"