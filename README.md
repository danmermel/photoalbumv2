# photalbummv2


## npm install for Apple M1

Our Lambdas are running on X64 architecture (Intel chips), so if building the Lambda deployment zips on an Apple (ARM chips) machine then you need to do:

```
npm install --arch=x64 --platform=linux --libc=glibc sharp
```

to make sure that the Intel version of the binary "sharp" library is used.