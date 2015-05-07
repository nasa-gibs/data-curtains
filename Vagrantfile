# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "vm.bootstrap"
  config.vm.hostname = "data-curtains"
  config.vm.network "forwarded_port", guest: 80, host: 8888

  config.vm.provider "virtualbox" do |vb|
      vb.name = "data-curtains"
  end
end
