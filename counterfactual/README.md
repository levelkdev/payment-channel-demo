# Counterfactual Account Demo

> Example demos of counterfactual accounts

## Demo6

NOTE: This is a work-in-progress.

### Demo steps

- [x] Alice registers with hub like any other web2 provider (email/password, Google OAuth)
- [x] After logged in, hub generates contract address using create2 and displays on Alice’s page
- [x] Alice’s page shows contract deployed status : “not deployed”
- [x] Alice logs out
- [x] Alice clicks lost password (web2 style - she is emailed a new password link)
- [x] Alice is logged back in
- [x] Bob sends her 20 ETH
- [x] Alice’s page shows she has twenty ETH
- [x] Alice’s “send 1 ETH to Charlie button” becomes active
- [x] Hub deploys contract, pays gas fee but deployed contract allows hub gas refund
- [x] Alice’s page shows contract deployed status : “active” (use web3.getCode)
- [x] Show that Charlie has 1 ETH
- [x] Alice’s page shows 18.xx (new ETH total after sending Charlie 1 ETH and paying for gas)
- [x] Alice logs out

### Instructions

Create local module symlinks (must do this after ever npm install)

```bash
make link
```

Start parity client

```bash
make start/parity
```

Test contracts

```bash
make test/contracts
```

Deploy contracts

```bash
make deploy/contracts
```

Start hub

```bash
make start/hub
```

Build loopback client for frontend

```bash
make build/client/loopback
```

Start frontend

```bash
start/frontend
```

### TODO

- [ ] clean up

## License

MIT
