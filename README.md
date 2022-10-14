# WSL notes

## Rebuilding kernel with kvm support

This instructions are based on https://microhobby.com.br/blog/2019/09/21/compiling-your-own-linux-kernel-for-windows-wsl2/

1. Clone source

```
git clone https://github.com/microsoft/WSL2-Linux-Kernel.git
cd WSL2-Linux-Kernel
```

2. Reconfigure kernel

Enable kvm, as described here https://wiki.gentoo.org/wiki/QEMU#Kernel

```
make menuconfig KCONFIG_CONFIG=Microsoft/config-wsl
```

3. Build kernel

```
make KCONFIG_CONFIG=Microsoft/config-wsl -j8
```

4. Copy kernel

```
cp vmlinux /mnt/c/Users/<seuUser>/
```

5. Copy `.wslconfig` file to user home

## Starting WSL with KVM support

1. Copy `run-wsl.bat`, `attach.wdbg` and `patch_wsl_nested.js` to same folder
2. Fix path in `attach.wdbg`
3. Open admin powershell in that folder
4. Run `./run-wsl.bat` and follow instructions