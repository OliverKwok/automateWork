### TODO

- [ ] draw db diagram
  - [ ] status
- [x] connect knex and psql
- [x] read data from excel
- [x] write wip data to db
- [ ] write unclosed data to db
- [ ] write stock level to db
- [ ] think work flow
- [ ] auto download outlook attachment
- [ ] auto generate not close report

daily morning update

- download wip
- download 未閉環 excel
- use wip update
- use 未閉環 excel update
  > if 未閉環 has record but db no record > add record
  > if 未閉環 no record but db has record > change db record status
  > if both have record > update data
