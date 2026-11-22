default:
    @just --list

install:
    @./wf install

login:
    @./wf login

status:
    @./wf status

build face="segment":
    @./wf build {{quote(face)}}

preview face="segment":
    @./wf preview {{quote(face)}}

mock face="segment":
    @./wf mock {{quote(face)}}

assets face="segment":
    @./wf assets {{quote(face)}}

bundle face="segment":
    @./wf bundle {{quote(face)}}

typecheck:
    @./wf typecheck

sh:
    @./wf sh
