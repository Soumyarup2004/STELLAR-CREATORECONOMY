#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Address, Map};

#[contract]
pub struct CreatorEconomy;

#[contractimpl]
impl CreatorEconomy {

    // Register a creator
    pub fn register_creator(env: Env, creator: Address) {
        creator.require_auth();

        let key = Symbol::new(&env, "CREATOR");
        let mut creators: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if creators.contains_key(creator.clone()) {
            panic!("Already registered");
        }

        creators.set(creator.clone(), 0);
        env.storage().instance().set(&key, &creators);
    }

    // Tip a creator
    pub fn tip_creator(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let key = Symbol::new(&env, "CREATOR");
        let mut creators: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if !creators.contains_key(to.clone()) {
            panic!("Creator not found");
        }

        // Increase creator balance
        let current = creators.get(to.clone()).unwrap_or(0);
        creators.set(to.clone(), current + amount);

        env.storage().instance().set(&key, &creators);

        // NOTE: This example does NOT transfer tokens (simplified)
    }

    // Get creator earnings
    pub fn get_earnings(env: Env, creator: Address) -> i128 {
        let key = Symbol::new(&env, "CREATOR");
        let creators: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        creators.get(creator).unwrap_or(0)
    }
}