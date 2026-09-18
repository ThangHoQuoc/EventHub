# Git thuc hanh cho EventHub

Tai lieu nay giai thich Git theo cach dung trong mot du an backend Java nhu EventHub. Muc tieu khong phai hoc thuoc tat ca lenh, ma la biet minh dang o dau, lenh sap chay se anh huong gi, va cach quay lai khi sai.

## 1. Ban do Git trong 30 giay

Git co bon noi de nho:

```text
Working directory  ->  Staging area  ->  Local repository  ->  Remote repository (GitHub)
file dang sua           git add          git commit           git push
```

- **Working directory**: cac file trong may ban, vi du `backend/src/main/java/.../EventServiceImpl.java`.
- **Staging area**: danh sach thay doi ban chon cho commit ke tiep.
- **Local repository**: lich su commit trong may.
- **Remote repository**: ban sao chung tren GitHub (`origin`).

Ba cau hoi truoc khi dung lenh:

1. Toi dang o nhanh nao? Dung `git status`.
2. Thay doi dang o working directory, staging, hay da commit? Dung `git status` va `git diff`.
3. Lenh nay chi xem, tao commit moi, hay viet lai lich su? Doc ky nhom can than trong tai lieu nay.

Quy uoc cua EventHub:

- `main` luon la nhanh on dinh, chi nhan thay doi qua Pull Request (PR).
- Moi viec co mot nhanh ngan han: `feature/...`, `fix/...`, `docs/...`, `test/...`, `refactor/...`.
- Khong dung tien to `codex/` cho nhanh moi.
- Mot commit nen lam mot viec ro rang, vi du `fix: enforce active user authentication`.
- Khong commit `.env`, mat khau, token, `backend/target/`, hay file IDE. `.gitignore` cua EventHub da bao ve cac file pho bien nay, nhung van can xem diff truoc khi commit.

## 2. Flow lam viec hang ngay o EventHub

Day la flow phu hop cho ca tu lam va lam viec nhom nho. Vi du ban sap them Booking o giai doan sau.

```text
main tren GitHub
       |
       v
cap nhat main local -> tao feature/booking-create -> code + test -> commit
       |                                                     |
       +---------------------- push + tao PR <--------------+
                                                              |
                                                        review + merge
                                                              |
                                                              v
                                                         quay lai main
```

```powershell
# 1. Bat dau tu main moi nhat
git switch main
git pull --ff-only origin main

# 2. Tao nhanh cho mot viec duy nhat
git switch -c feature/booking-create

# 3. Lam viec, xem thay doi, chay test phu hop
git status
git diff

# 4. Chon dung file va tao diem luu local
git add backend/src/main/java/com/eventhub/eventhub_backend/booking
git add backend/src/test/java/com/eventhub/eventhub_backend/booking
git commit -m "feat: add booking creation flow"

# 5. Day nhanh len GitHub lan dau
git push --set-upstream origin feature/booking-create
```

Sau do tao PR tren GitHub: base la `main`, compare la `feature/booking-create`. Truoc khi bam Merge, xem tab **Files changed**, kiem tra CI/test, va doc lai ten commit. Khi PR da merge, cap nhat lai local:

```powershell
git switch main
git pull --ff-only origin main
git branch -d feature/booking-create
```

`git branch -d` chi xoa nhanh local khi Git thay no da duoc merge. Day la lua chon an toan; dung `-D` chi khi ban chac nhanh lab/thu nghiem khong can nua.

## 3. Cac lenh can biet

### `git clone`

**Dung de:** tai mot repository ve may lan dau. No tu tao remote mac dinh ten `origin`.

```powershell
git clone https://github.com/ThangHoQuoc/EventHub.git
cd EventHub
```

**Gap khi di lam:** clone repo khi moi vao team hoac khi muon co mot ban sao sach. Chi clone mot lan cho moi thu muc lam viec; cac lan sau dung `git pull` hoac `git fetch`.

### `git status`

**Dung de:** tra loi "toi dang o nhanh nao va co file nao thay doi?" Day la lenh nen chay nhieu nhat.

```powershell
git status --short --branch
```

Vi du ket qua co the la:

```text
## feature/ticket-type-delete...origin/feature/ticket-type-delete
 M backend/src/main/java/.../TicketTypeServiceImpl.java
?? docs/GIT_WORKFLOW_GUIDE.md
```

- ` M`: file da sua nhung chua `git add`.
- `M `: file da duoc stage.
- `??`: file moi, Git chua theo doi.

### `git diff`

**Dung de:** xem chinh xac dong nao da thay doi truoc khi stage/commit. Day la cach de khong vo tinh dua sua doi khong lien quan vao PR.

```powershell
# So sanh working directory voi staging area
git diff

# So sanh phan da stage voi commit gan nhat
git diff --staged

# Xem thay doi cua nhanh hien tai so voi main
git diff main...HEAD

# Chi xem mot file EventHub
git diff -- backend/src/main/java/com/eventhub/eventhub_backend/event/service/Impl/EventServiceImpl.java
```

Trong review, dung `git diff main...HEAD` de kiem tra toan bo PR truoc khi push.

### `git add`

**Dung de:** chon file hoac mot phan thay doi se di vao commit ke tiep. `git add` khong day code len GitHub.

```powershell
# Nen dung: chon ro file
git add docs/GIT_WORKFLOW_GUIDE.md

# Khi mot file co nhieu thay doi khac nhau, stage tung khoi
git add -p backend/src/main/java/com/eventhub/eventhub_backend/event/service/Impl/EventServiceImpl.java

# Kiem tra truoc commit
git diff --staged
```

Han che `git add .` khi chua xem `git status`; no co the stage file tam, file cau hinh, hoac sua doi cua viec khac.

### `git commit`

**Dung de:** tao mot diem luu co ten trong local repository. Commit khong tu dong len GitHub.

```powershell
git commit -m "docs: add EventHub Git workflow guide"
git commit -m "fix: reject ticket type deletion after sales"
```

Ten commit nen theo mau `<type>: <y nghia>`:

| Type | Khi dung | Vi du EventHub |
|---|---|---|
| `feat` | Them kha nang moi | `feat: add ticket type delete flow` |
| `fix` | Sua loi hanh vi | `fix: enforce event update lifecycle rules` |
| `test` | Chi them/sua test | `test: cover inactive user login` |
| `docs` | Chi tai lieu | `docs: add Git workflow guide` |
| `refactor` | Don gian code, khong doi hanh vi | `refactor: extract event ownership check` |
| `chore` | Cau hinh/tooling | `chore: configure Maven wrapper` |

### `git push`

**Dung de:** day commit local len remote/GitHub.

```powershell
# Lan dau cho nhanh moi
git push --set-upstream origin docs/git-workflow-guide

# Cac lan sau, nhanh da co upstream
git push
```

Sau `push`, GitHub moi thay nhanh va ban moi tao duoc PR. Khong push truc tiep vao `main` trong flow lam viec nhom.

### `git pull`

**Dung de:** lay thay doi tu remote va tich hop vao nhanh hien tai. Ve ban chat, no la `git fetch` roi den `merge` hoac `rebase` tuy cau hinh/lenh ban dung.

```powershell
# Cap nhat main theo cach an toan: chi cho phep fast-forward
git switch main
git pull --ff-only origin main

# Cap nhat nhanh ca nhan truoc khi mo PR
git fetch origin
git rebase origin/main
```

Dung `git pull --ff-only origin main` tren `main` de tranh vo tinh tao merge commit local. Neu lenh bao khong fast-forward, dung lai va xem phan `merge`/`rebase` ben duoi.

### `git fetch`

**Dung de:** tai thong tin commit/nhanh moi tu GitHub ve may, nhung **khong sua file dang lam** va khong tu dong nhap vao nhanh hien tai.

```powershell
git fetch origin
git log --oneline HEAD..origin/main
git diff HEAD...origin/main
```

Day la lenh rat an toan truoc khi quyet dinh `merge`, `rebase`, hay chi muon xem dong doi da them gi vao `main`. Trong cong ty, hay dung `fetch` dau tien khi ban chua chac minh muon tich hop thay doi theo cach nao.

### `git branch`

**Dung de:** xem, tao, doi ten, hoac xoa nhanh.

```powershell
git branch -vv
git branch feature/booking-create
git branch -d docs/git-workflow-guide
git branch -m docs/git-workflow-guide docs/git-guide
```

Thuong dung `git switch -c` hon `git branch` khi tao nhanh vi no vua tao vua chuyen vao nhanh moi. `git branch -vv` cho biet nhanh nao dang theo doi nhanh remote nao.

### `git switch`

**Dung de:** chuyen nhanh hoac tao nhanh moi. Day la cach hien dai, de doc hon `git checkout`.

```powershell
git switch main
git switch fix/event-search-category
git switch -c fix/booking-duplicate-request
git switch -
```

`git switch -` quay lai nhanh truoc do. Truoc khi switch, chay `git status`; Git co the khong cho chuyen neu thay doi chua commit cua ban se bi de len.

### `git merge`

**Dung de:** ket hop commit cua mot nhanh vao nhanh hien tai va giu lai lich su hai nhanh. No khong viet lai cac commit cu.

```powershell
# Dang o nhanh cua ban, cap nhat code moi tu main
git switch feature/booking-create
git fetch origin
git merge origin/main
```

**Nen dung khi:** nhanh da duoc nhieu nguoi dung/chia se, team uu tien lich su phan nhanh trung thuc, hoac chinh sach PR cua cong ty dung merge commit.

**Co the gap:** merge tu dong thanh cong, fast-forward, hoac conflict. Neu conflict, Git dung lai de ban tu xu ly; xem phan lab xung dot.

### `git rebase`

**Dung de:** dat lai commit cua nhanh hien tai len tren commit moi nhat cua nhanh khac. Lich su gon, nhu ban bat dau viec sau khi `main` da cap nhat.

```powershell
git switch feature/booking-create
git fetch origin
git rebase origin/main
```

Minh hoa:

```text
Truoc rebase:
main:     A --- B --- C
feature:           \--- D --- E

Sau rebase feature len main:
main:     A --- B --- C
feature:                 \--- D' --- E'
```

`D'` va `E'` la commit moi co noi dung tuong tu `D`, `E`, nhung hash khac. Vi vay:

- Nen rebase nhanh chi minh ban dang dung, truoc khi mo PR hoac truoc khi chia se rong.
- Khong rebase `main` va khong rebase nhanh chung cua nhieu nguoi neu chua thong nhat.
- Neu da push nhanh ca nhan va rebase, day lai bang `git push --force-with-lease`, khong dung `--force`.

```powershell
git push --force-with-lease
```

`--force-with-lease` tu choi ghi de neu tren remote co commit moi ma may ban chua biet. Day van la thao tac can than, khong dung cho `main`.

### Chon `merge` hay `rebase`?

| Tinh huong | Lua chon phu hop | Ly do |
|---|---|---|
| Cap nhat `main` local | `git pull --ff-only origin main` | Khong tao commit thua |
| Nhanh ca nhan chua/chi minh dung, muon PR gon | `git fetch` + `git rebase origin/main` | Lich su tuyen tinh |
| Nhanh chung nhieu nguoi dang push | `git fetch` + `git merge origin/main` | Khong viet lai commit cua nguoi khac |
| Chi muon xem remote co gi moi | `git fetch origin` | Chua dong vao code dang lam |
| Cong ty quy dinh mot cach cu the | Lam theo quy dinh team | Tinh nhat quan quan trong hon so thich ca nhan |

### `git stash`

**Dung de:** tam cat thay doi chua commit de lam viec khac. Hinh dung nhu dat do dang lam vao ngan ke tam thoi.

```powershell
# Dang sua Booking nhung can sua nong Auth truoc
git stash push -u -m "wip: booking request validation"
git switch fix/auth-user-status-check

# Khi quay lai
git switch feature/booking-create
git stash list
git stash pop
```

`-u` bao gom file moi chua duoc track. Dung stash cho viec ngan; neu cong viec da ro rang va can giu lau, commit WIP tren nhanh rieng se de tim va an toan hon.

Neu `stash pop` gay conflict, xu ly nhu conflict binh thuong, sau do kiem tra `git stash list` vi stash co the van con de tranh mat du lieu.

### `git restore`

**Dung de:** bo thay doi chua commit o working directory hoac bo stage. Day la lenh phuc hoi file, can dung can than vi noi dung chua commit se mat.

```powershell
# Bo thay doi chua stage cua mot file (co the mat noi dung dang sua)
git restore backend/src/main/java/com/eventhub/eventhub_backend/event/service/Impl/EventServiceImpl.java

# Dua file ra khoi staging, nhung GIU noi dung dang sua
git restore --staged docs/GIT_WORKFLOW_GUIDE.md
```

Truoc `git restore <file>`, hay chay `git diff -- <file>`. Neu do la thay doi co gia tri, commit hoac stash truoc.

### `git revert`

**Dung de:** tao mot commit moi de dao nguoc thay doi cua mot commit cu. Day la cach sua an toan cho commit da len GitHub/da merge.

```powershell
# Vi du PR TicketType Delete da merge nhung phat hien loi nghiem trong
git switch main
git pull --ff-only origin main
git switch -c revert/ticket-type-delete
git revert <merged-commit-hash>
git push --set-upstream origin revert/ticket-type-delete
```

Lay `<merged-commit-hash>` bang `git log --oneline main` hoac tren GitHub. Sau do mo PR `revert/ticket-type-delete` vao `main`; khong push thang vao `main`. Lich su van giu ca commit loi va commit dao nguoc, nen team de audit va phuc hoi lai khi can.

### `git reset`

**Dung de:** di chuyen con tro HEAD/staging; tuy chon co the giu hoac bo thay doi. Day la lenh manh, chi nen dung cho commit local chua chia se.

| Lenh | Commit | Staging | File dang sua | Khi dung |
|---|---|---|---|---|
| `git reset --soft HEAD~1` | Lui 1 commit | Giu stage | Giu | Muon sua lai commit gan nhat |
| `git reset HEAD~1` | Lui 1 commit | Bo stage | Giu | Muon tach commit gan nhat thanh cac commit nho |
| `git reset --hard HEAD~1` | Lui 1 commit | Bo | Bo | Bo hoan toan commit local gan nhat |

```powershell
# Cach thuong dung: bo commit local gan nhat nhung giu code de commit lai
git reset --soft HEAD~1

# Nguy hiem: lam mat code chua duoc commit/push
git reset --hard HEAD~1
```

Khong `reset` commit da push tren nhanh chung hay `main`. Dung `git revert` thay the. Neu lo `reset --hard`, xem phan `git reflog` de cuu.

### `git cherry-pick`

**Dung de:** lay mot commit cu the tu nhanh khac sang nhanh hien tai ma khong merge ca nhanh.

```powershell
# Vi du nhanh booking can dung lai mot commit sua xac thuc da co o nhanh khac
git switch feature/booking-create
git cherry-pick 9fe3f5f
```

Hay dung khi can hotfix mot thay doi nho sang release branch, hoac dua mot commit docs/test doc lap sang nhanh dang lam. Neu conflict, sua file, `git add <file>`, roi `git cherry-pick --continue`. Khong dung cherry-pick de thay the cho quy trinh merge PR thong thuong, vi de tao commit trung lap va kho theo doi.

### `git log`

**Dung de:** doc lich su commit.

```powershell
git log --oneline --decorate -15
git log --graph --oneline --all
git log main..HEAD --oneline
git log -- backend/src/main/java/com/eventhub/eventhub_backend/ticket
```

`git log main..HEAD --oneline` cho biet nhung commit se xuat hien trong PR hien tai. Day la lenh rat hay truoc khi tao PR.

### `git reflog`

**Dung de:** xem nhat ky nhung vi tri HEAD da tung di qua tren may ban. No la phao cuu sinh khi vua reset, rebase, commit nham, hoac xoa nhanh local.

```powershell
git reflog --date=local -15
git switch -c recover/booking-work HEAD@{3}
```

Vi du `HEAD@{3}` co the la trang thai truoc luc ban chay `git reset --hard`. Tao nhanh `recover/...` truoc de giu an toan, sau do xem `git diff` va quyet dinh cach dua code tro lai.

`reflog` la lich su local, khong phai backup vinh vien tren GitHub. Dung no som khi phat hien sai.

### `git tag`

**Dung de:** danh dau mot diem phat hanh co y nghia, vi du phien ban demo da on dinh. Tag khong phai nhanh; no gan voi mot commit cu the.

```powershell
# Sau khi main da pass test va demo Phase 4 on dinh
git switch main
git pull --ff-only origin main
git tag -a v0.4.0 -m "Phase 4 ticket management demo"
git push origin v0.4.0

# Xem tag
git tag -n
git show v0.4.0
```

Dung tag khi co milestone: `v0.1.0` cho Auth, `v0.2.0` cho Event Management, hoac `v1.0.0` khi project du tieu chuan release. Khong doi/di chuyen tag da cong bo neu khong co ly do rat ro rang.

## 4. Xung dot Git: no la gi va xu ly the nao?

Conflict xay ra khi Git khong the tu quyet dinh cach ket hop hai thay doi. Thuong gap nhat la hai nguoi sua cung dong hoac cung khoi logic.

Vi du o EventHub:

```text
Ban sua EventServiceImpl.updateEvent() de ap dung lifecycle DRAFT/PUBLISHED.
Nguoi khac cung sua doan nay de them validation startAt/endAt.
```

Neu mot ban rebase/merge `main` vao nhanh kia, Git co the dung lai voi noi dung nhu sau:

```java
< < < < < < < HEAD
if (event.getStatus() == EventStatus.PUBLISHED) {
    validatePublishedEventUpdate(request);
}
= = = = = = =
validateEventTimes(request.getStartAt(), request.getEndAt());
> > > > > > > origin/main
```

- Trong conflict that, moi marker tren la **7 ky tu lien nhau khong co khoang trang**. Cac khoang trang o day chi de tai lieu khong bi Git hieu nham la file dang conflict.
- Tu `<<<<<<< HEAD` den `=======` la phien ban dang o nhanh hien tai.
- Tu `=======` den `>>>>>>> origin/main` la phien ban dang duoc nhap vao.
- Khong duoc xoa dai mot ben theo phan xa. Doc ca hai, hieu business rule, roi viet lai ket qua dung. Cuoi cung phai xoa tat ca marker `<<<<<<<`, `=======`, `>>>>>>>`.

Quy trinh xu ly conflict:

```powershell
# 1. Xem danh sach file conflict
git status

# 2. Mo file, sua noi dung ket hop va xoa conflict markers

# 3. Danh dau file da xu ly
git add backend/src/main/java/com/eventhub/eventhub_backend/event/service/Impl/EventServiceImpl.java

# 4a. Neu dang merge
git merge --continue

# 4b. Neu dang rebase
git rebase --continue

# 5. Chay test lien quan, sau do xem lai diff
git diff main...HEAD
```

Neu thay conflict phuc tap hon du kien, huy thao tac dang do de quay ve truoc luc bat dau:

```powershell
git merge --abort
# hoac
git rebase --abort
```

Khong chay `git commit` lung tung khi Git dang bao dang merge/rebase. Lam theo `git status`; no thuong noi ro buoc tiep theo.

## 5. Lab conflict an toan (khong anh huong main)

Muc tieu: tu tay tao va giai mot conflict nho. Tat ca nhanh trong lab deu bat dau bang `practice/` va khong can mo PR.

Mo PowerShell tai thu muc EventHub. Thu tu nay tao mot commit nen rieng, sau do de hai nhanh sua cung mot dong.

```powershell
# Tao nhanh nen cho lab
git switch main
git pull --ff-only origin main
git switch -c practice/conflict-base
New-Item -ItemType Directory -Force docs/labs
Set-Content -Path docs/labs/conflict-note.txt -Value "EventHub conflict practice: original message" -Encoding utf8
git add docs/labs/conflict-note.txt
git commit -m "docs: add conflict practice base"

# Nhanh A sua dong nay theo cach A
git switch -c practice/conflict-a
Set-Content -Path docs/labs/conflict-note.txt -Value "EventHub conflict practice: message from branch A" -Encoding utf8
git add docs/labs/conflict-note.txt
git commit -m "docs: write conflict practice message A"

# Quay ve diem nen, tao nhanh B sua CUNG dong do theo cach B
git switch practice/conflict-base
git switch -c practice/conflict-b
Set-Content -Path docs/labs/conflict-note.txt -Value "EventHub conflict practice: message from branch B" -Encoding utf8
git add docs/labs/conflict-note.txt
git commit -m "docs: write conflict practice message B"

# Thu nhap B vao A va quan sat conflict
git switch practice/conflict-a
git merge practice/conflict-b
git status
```

Mo `docs/labs/conflict-note.txt`. Ban se thay marker conflict. Hay sua file thanh mot ket qua co y nghia, vi du:

```text
EventHub conflict practice: combined message from branches A and B
```

Sau do hoan tat merge:

```powershell
git add docs/labs/conflict-note.txt
git merge --continue
git log --graph --oneline --all -12
```

Khi da hoc xong, co the giu nhanh lab de xem lich su. Neu muon don dep, chuyen sang `main` roi xoa dung cac nhanh lab nay:

```powershell
git switch main
git branch -D practice/conflict-a
git branch -D practice/conflict-b
git branch -D practice/conflict-base
```

`-D` trong buoc don dep la co chu dich: cac nhanh nay khong merge vao `main`. Khong dung mau lenh nay cho nhanh feature that cua ban.

## 6. Nhung tinh huong hay gap o cong ty

| Tinh huong | Dung lenh gi truoc | Xu ly dung |
|---|---|---|
| Vua quay lai lam viec sau 1 ngay | `git status`, `git switch main`, `git pull --ff-only origin main` | Cap nhat main roi tao/cap nhat nhanh cong viec |
| Dong doi vua merge PR, ban dang lam feature | `git fetch origin` | Rebase nhanh ca nhan len `origin/main`, giai conflict va test |
| Ban can sua hotfix nhung code hien tai chua xong | `git status` | `git stash push -u -m "wip: ..."`, switch sang nhanh hotfix |
| Da commit nham o nhanh local, chua push | `git log --oneline -3` | `git reset --soft HEAD~1`, sua/stage/commit lai |
| PR da merge nhung gay loi production | `git log --oneline` | Tao PR `revert/...` voi `git revert <hash>`; khong reset main |
| Da `reset --hard` nham | `git reflog` | Tao nhanh `recover/...` tu commit truoc do |
| Can lay mot hotfix sang release branch | `git log` | `git cherry-pick <hash>`, test ky va mo PR |
| Push bi tu choi `non-fast-forward` | `git status`, `git fetch origin` | Kiem tra remote co commit moi, merge/rebase theo quy uoc team; khong force push theo phan xa |
| Conflict trong rebase/merge | `git status` | Doc context, sua dung business logic, `git add`, `--continue`, chay test |
| Muon xem PR cua minh co gi truoc khi gui review | `git log main..HEAD`, `git diff main...HEAD` | Bo file khong lien quan, sua commit neu can, roi push |

## 7. Quy tac vang de tranh mat code va gay roi lich su

1. Bat dau buoi lam viec bang `git status`; bat dau task moi bang cap nhat `main`.
2. Truoc `git add`, xem `git diff`; truoc `git commit`, xem `git diff --staged`.
3. Commit nho, ro y dinh, mot commit mot viec. PR nho de review va merge de hon.
4. Khong force push vao `main`; voi nhanh ca nhan sau rebase, chi dung `--force-with-lease` khi da hieu ly do.
5. Commit da chia se/merge thi dung `revert`, khong dung `reset` de sua lich su chung.
6. Khi conflict, khong chon mot ben may moc. Ket hop dung business rule, chay test roi moi continue.
7. Khi thay minh mat phuong huong, dung lai va chay `git status`, `git log --oneline --decorate -10`, `git reflog` truoc. Git thuong co du du lieu de cuu viec neu ban chua xoa/ghi de vo toi va.

## 8. Cheat sheet cho EventHub

```powershell
# Bat dau task
git switch main
git pull --ff-only origin main
git switch -c feature/short-name

# Trong luc code
git status --short --branch
git diff
git add <file>
git diff --staged
git commit -m "feat: short meaningful message"

# Day PR
git push --set-upstream origin feature/short-name
git log main..HEAD --oneline
git diff main...HEAD

# Cap nhat nhanh ca nhan theo main
git fetch origin
git rebase origin/main

# Cuu ho
git stash push -u -m "wip: description"
git reflog
git revert <shared-commit-hash>
```

Nho mot nguyen tac don gian: `status` de biet minh dang o dau, `diff` de biet minh sap thay doi gi, `commit` de tao diem luu, va PR de dua thay doi vao `main` mot cach co review.
